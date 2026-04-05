// ============================================
// WhatsApp Flow Engine — TASK-020
// ============================================
// Core logic for processing automated WhatsApp flows,
// matching keywords, and managing multi-step conversation states.

import { eq, and, ilike, sql } from 'drizzle-orm';
import { automationFlows, conversationStates } from '../db/schema';
import type { Database } from '../db/client';
import { parseReply, matchOption } from './reply-parser';
import { sendWhatsAppMessage } from './twilio';

export type FlowStep = {
  id: string;
  type: 'message' | 'question' | 'choice' | 'action' | 'handoff';
  content: string;
  options?: Array<{ label: string; value: string; next_step_id?: string }>;
  next_step_id?: string;
  variable_name?: string; // If 'question' or 'choice', stores result here in state metadata
  action_type?: 'create_donation_link' | 'notify_admin';
};

interface ConversationState {
  id: string;
  tenant_id: string;
  person_id: string;
  flow_id: string;
  current_step_id: string | null;
  metadata: any;
  expires_at: Date | null;
}

/**
 * Main engine class for processing flows.
 */
export class FlowEngine {
  constructor(
    private db: Database,
    private config: {
      accountSid: string;
      authToken: string;
      whatsappNumber: string;
      tenantId: string;
    },
  ) {}

  /**
   * Processes an incoming message and returns true if handled by a flow.
   */
  async processIncoming(personId: string, body: string): Promise<boolean> {
    // 1. Check for active conversation state
    const activeState = await this.db.query.conversationStates.findFirst({
      where: and(
        eq(conversationStates.tenant_id, this.config.tenantId),
        eq(conversationStates.person_id, personId),
        sql`${conversationStates.expires_at} > NOW()`,
      ),
      with: {
        flow_id: true,
      },
    });

    if (activeState) {
      console.log(`[FLOW] Active state found for person ${personId}: flow ${activeState.flow_id}`);
      await this.continueFlow(activeState, body);
      return true;
    }

    // 2. Check for keyword triggers
    const trigger = await this.db.query.automationFlows.findFirst({
      where: and(
        eq(automationFlows.tenant_id, this.config.tenantId),
        eq(automationFlows.is_active, true),
        eq(automationFlows.trigger_type, 'Keyword'),
        ilike(automationFlows.trigger_value, body.trim()),
      ),
    });

    if (trigger) {
      console.log(`[FLOW] Keyword match found: ${trigger.name}`);
      await this.startFlow(trigger, personId);
      return true;
    }

    return false;
  }

  /**
   * Manually triggers a flow for a person.
   */
  public async triggerFlow(flow: any, personId: string) {
    await this.startFlow(flow, personId);
  }

  /**
   * Starts a new flow for a person.
   */
  private async startFlow(flow: any, personId: string) {
    const steps = flow.steps as FlowStep[];
    if (steps.length === 0) return;

    // Create state
    const [state] = await this.db
      .insert(conversationStates)
      .values({
        tenant_id: this.config.tenantId,
        person_id: personId,
        flow_id: flow.id,
        current_step_id: steps[0].id,
        metadata: {},
        expires_at: new Date(Date.now() + 30 * 60000), // 30 min expiry
      })
      .returning();

    await this.executeStep(state, flow, steps[0]);
  }

  /**
   * Continues an existing flow based on current state and input.
   */
  private async continueFlow(state: ConversationState, input: string) {
    const flow = await this.db.query.automationFlows.findFirst({
      where: eq(automationFlows.id, state.flow_id),
    });

    if (!flow || !flow.is_active) {
      await this.db.delete(conversationStates).where(eq(conversationStates.id, state.id));
      return;
    }

    const steps = flow.steps as FlowStep[];
    const currentStep = steps.find((s) => s.id === state.current_step_id);

    if (!currentStep) {
      await this.db.delete(conversationStates).where(eq(conversationStates.id, state.id));
      return;
    }

    // Process input for the current step
    let nextStepId: string | undefined = currentStep.next_step_id;
    const metadata = { ...(state.metadata as Record<string, any>) };

    if (currentStep.type === 'choice' && currentStep.options) {
      const parsed = parseReply(input);
      const selected = matchOption(parsed, currentStep.options);

      if (selected) {
        if (currentStep.variable_name) {
          metadata[currentStep.variable_name] = selected.value;
        }
        nextStepId = selected.next_step_id || currentStep.next_step_id;
      } else {
        // Validation failed, repeat the question
        await this.executeStep(
          state,
          flow,
          currentStep,
          "I'm sorry, I didn't catch that. Please select one of the following options:",
        );
        return;
      }
    } else if (currentStep.type === 'question') {
      if (currentStep.variable_name) {
        metadata[currentStep.variable_name] = input.trim();
      }
    }

    // Update state with metadata and move to next step
    if (nextStepId) {
      const nextStep = steps.find((s) => s.id === nextStepId);
      if (nextStep) {
        await this.db
          .update(conversationStates)
          .set({
            current_step_id: nextStepId,
            metadata,
            updated_at: new Date(),
          })
          .where(eq(conversationStates.id, state.id));

        await this.executeStep(state, flow, nextStep);
      } else {
        // End of flow
        await this.db.delete(conversationStates).where(eq(conversationStates.id, state.id));
      }
    } else {
      // End of flow
      await this.db.delete(conversationStates).where(eq(conversationStates.id, state.id));
    }
  }

  /**
   * Executes a specific step (sending message, checking actions).
   */
  private async executeStep(
    state: ConversationState,
    flow: { steps: any },
    step: FlowStep,
    prefix?: string,
  ) {
    if (step.type === 'handoff') {
      console.log(`[FLOW] Handoff triggered for person ${state.person_id}`);
      // Send a notification message
      const phoneNumber = await this.getPersonPhone(state.person_id);
      if (phoneNumber) {
        await sendWhatsAppMessage(
          {
            accountSid: this.config.accountSid,
            authToken: this.config.authToken,
            whatsappNumber: this.config.whatsappNumber,
          },
          phoneNumber,
          "I'm connecting you with one of our staff members. They will be with you shortly. Assalamu Alaikum!",
        );
      }

      // In a real system, we'd also trigger an event or notify a shared inbox.
      // For now, we clear the state so no more bot messages interfere.
      await this.db.delete(conversationStates).where(eq(conversationStates.id, state.id));
      return;
    }

    let body = step.content;
    if (prefix) body = `${prefix}\n\n${body}`;

    // Append options for choices
    if (step.type === 'choice' && step.options) {
      const optionsText = step.options.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n');
      body = `${body}\n\n${optionsText}`;
    }

    // Variable parsing in content (e.g., "Hello {{first_name}}")
    // For now, very simple replacement from state metadata
    if (state.metadata) {
      for (const [key, val] of Object.entries(state.metadata as Record<string, any>)) {
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), val as string);
      }
    }

    // Send the message
    const phoneNumber = await this.getPersonPhone(state.person_id);
    if (!phoneNumber) return;

    await sendWhatsAppMessage(
      {
        accountSid: this.config.accountSid,
        authToken: this.config.authToken,
        whatsappNumber: this.config.whatsappNumber,
      },
      phoneNumber,
      body,
    );

    // If step is just a message and has a direct next_step_id, advance immediately
    if (step.type === 'message' && step.next_step_id) {
      const steps = flow.steps as FlowStep[];
      const nextStep = steps.find((s) => s.id === step.next_step_id);
      if (nextStep) {
        await this.db
          .update(conversationStates)
          .set({
            current_step_id: step.next_step_id,
            updated_at: new Date(),
          })
          .where(eq(conversationStates.id, state.id));

        await this.executeStep(state, flow, nextStep);
      }
    }
  }

  private async getPersonPhone(personId: string): Promise<string | null> {
    const person = await this.db.query.persons.findFirst({
      where: eq(sql`id`, personId),
    });
    return person?.phone_number?.replace('＋', '+') || null;
  }
}
