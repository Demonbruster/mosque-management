import { Button, Checkbox, Grid, Group, Select, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import { genderEnum, personCategoryEnum } from '../../../../backend/src/db/schema';

const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: '[EMAIL_ADDRESS]',
  phoneNumber: '1234567890',
  nationalId: '1234567890',
  notes: 'Notes',
  gender: 'male',
  category: 'Member',
  whatsappOptIn: true,
  isActive: true,
};

export const UserDetailsChangeRequest = () => {
  const [changeRequest, setChangeRequest] = useState(false);

  const genderOptions = genderEnum.enumValues.map((gender) => ({
    value: gender,
    label: gender.charAt(0).toUpperCase() + gender.slice(1),
  }));

  const personCategoryOptions = personCategoryEnum.enumValues.map((category) => ({
    value: category,
    label: category.charAt(0).toUpperCase() + category.slice(1),
  }));

  return (
    <>
      <Button onClick={() => setChangeRequest(!changeRequest)}>
        {changeRequest ? 'Cancel' : 'Request Change'}
      </Button>
      {!changeRequest ? (
        <>
          <TextInput
            label="First Name"
            placeholder="First Name"
            value={userData.firstName}
            disabled
          />
          <TextInput label="Last Name" placeholder="Last Name" value={userData.lastName} disabled />
          <TextInput label="Email" placeholder="Email" value={userData.email} disabled />
          <TextInput
            label="Phone Number"
            placeholder="Phone Number"
            value={userData.phoneNumber}
            disabled
          />
          <Select
            label="Gender"
            placeholder="Gender"
            data={genderOptions}
            disabled
            value={userData.gender}
          />
          <Select
            label="Category"
            placeholder="Category"
            data={personCategoryOptions}
            disabled
            value={userData.category}
          />
          <TextInput
            label="National ID"
            placeholder="National ID"
            value={userData.nationalId}
            disabled
          />
          <TextInput label="Notes" placeholder="Notes" value={userData.notes} disabled />
          <Group mt={'sm'}>
            <Checkbox label="WhatsApp Opt In" defaultChecked={userData.whatsappOptIn} disabled />
            <Checkbox label="Is Active" defaultChecked={userData.isActive} disabled />
          </Group>
        </>
      ) : (
        <>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="First Name"
                placeholder="First Name"
                readOnly
                value={userData.firstName}
              />
              <TextInput
                label="Last Name"
                placeholder="Last Name"
                readOnly
                value={userData.lastName}
              />
              <TextInput label="Email" placeholder="Email" readOnly value={userData.email} />
              <TextInput
                label="Phone Number"
                placeholder="Phone Number"
                readOnly
                value={userData.phoneNumber}
              />
              <Select
                label="Gender"
                placeholder="Gender"
                data={genderOptions}
                disabled
                value={userData.gender}
              />
              <Select
                label="Category"
                placeholder="Category"
                data={personCategoryOptions}
                disabled
                value={userData.category}
              />
              <TextInput
                label="National ID"
                placeholder="National ID"
                value={userData.nationalId}
                disabled
              />
              <TextInput label="Notes" placeholder="Notes" value={userData.notes} disabled />
              <Group mt={'sm'}>
                <Checkbox
                  label="WhatsApp Opt In"
                  defaultChecked={userData.whatsappOptIn}
                  disabled
                />
                <Checkbox label="Is Active" defaultChecked={userData.isActive} disabled />
              </Group>
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput label="First Name" placeholder="First Name" />
              <TextInput label="Last Name" placeholder="Last Name" />
              <TextInput label="Email" placeholder="Email" />
              <TextInput label="Phone Number" placeholder="Phone Number" />
              <Select label="Gender" placeholder="Gender" data={genderOptions} />
              <Select label="Category" placeholder="Category" data={personCategoryOptions} />
              <TextInput label="National ID" placeholder="National ID" />
              <TextInput label="Notes" placeholder="Notes" />
              <Group mt={'sm'}>
                <Checkbox label="WhatsApp Opt In" defaultChecked={userData.whatsappOptIn} />
                <Checkbox label="Is Active" defaultChecked={userData.isActive} />
              </Group>
            </Grid.Col>
          </Grid>
          <Grid justify="flex-end" mt="md">
            <Button>Request</Button>
          </Grid>
        </>
      )}
    </>
  );
};
