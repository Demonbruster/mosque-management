// ============================================
// Trigger Runner - Scheduled Flows — TASK-020
// ============================================

import { eq, and, sql } from 'drizzle-orm';
import { automationFlows, personTags, persons, conversationStates } from '../db/schema';
import type { Database } from '../db/client';
import { FlowEngine } from './flow-engine';

/**
 * Runners for periodic triggers (e.g., cron-based).
 */
export class TriggerRunner {
  constructor(
    private db: Database,
    private config: {
      accountSid: string;
      authToken: string;
      whatsappNumber: string;
    },
  ) {}

  /**
   * Scans and executes all active scheduled flows.
   */
  async runScheduledTriggers() {
    console.log('[TRIGGER] Scanning for scheduled flows...');

    const scheduledFlows = await this.db.query.automationFlows.findMany({
      where: and(eq(automationFlows.trigger_type, 'Schedule'), eq(automationFlows.is_active, true)),
    });

    for (const flow of scheduledFlows) {
      console.log(`[TRIGGER] Executing scheduled flow: ${flow.name} (${flow.id})`);
      await this.executeScheduledFlow(flow);
    }
  }

  /**
   * Executes a specific scheduled flow for its audience.
   */
  private async executeScheduledFlow(flow: {
    id: string;
    name: string;
    tenant_id: string;
    audience_tag_name: string | null;
  }) {
    // 1. Identify target audience
    let targetPersonIds: string[];

    if (flow.audience_tag_name) {
      // Filter by tag name in the flat person_tags table
      const audience = await this.db
        .select({ personId: personTags.person_id })
        .from(personTags)
        .where(
          and(
            eq(personTags.tenant_id, flow.tenant_id),
            eq(personTags.tag_name, flow.audience_tag_name),
          ),
        );

      targetPersonIds = audience.map((a) => a.personId);
    } else {
      // Default: All active persons in this tenant with phone numbers
      const audience = await this.db
        .select({ id: persons.id })
        .from(persons)
        .where(
          and(eq(persons.tenant_id, flow.tenant_id), sql`${persons.phone_number} IS NOT NULL`),
        );

      targetPersonIds = audience.map((a) => a.id);
    }

    if (targetPersonIds.length === 0) {
      console.log(`[TRIGGER] No audience found for flow ${flow.id}`);
      return;
    }

    // 2. Start flow for each person (if not already in a flow)
    const flowEngine = new FlowEngine(this.db, {
      ...this.config,
      tenantId: flow.tenant_id,
    });

    for (const personId of targetPersonIds) {
      // Check if person already in an active flow (avoid spam)
      const activeState = await this.db.query.conversationStates.findFirst({
        where: and(
          eq(conversationStates.person_id, personId),
          sql`${conversationStates.expires_at} > NOW()`,
        ),
      });

      if (!activeState) {
        console.log(`[TRIGGER] Starting flow ${flow.id} for person ${personId}`);
        try {
          await flowEngine.triggerFlow(flow, personId);
        } catch (err) {
          console.error(`[TRIGGER] Error starting flow for ${personId}:`, err);
        }
      }
    }
  }
}
