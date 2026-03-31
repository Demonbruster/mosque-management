import { Button, Checkbox, Grid, Group, Select, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import { genderEnum, personCategoryEnum } from '../../../../backend/src/db/schema';
import { existingUser } from '../../../mockdata/userRequests';
import { useForm } from '@mantine/form';

export const UserDetailsChangeRequest = () => {
  const [changeRequest, setChangeRequest] = useState(false);
  const [userData, setUserData] = useState(existingUser);

  const form = useForm({
    initialValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      gender: userData.gender,
      category: userData.category,
      nationalId: userData.nationalId,
      notes: userData.notes,
      whatsappOptIn: userData.whatsappOptIn,
      isActive: userData.isActive,
    },
  });

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
              <form
                onSubmit={form.onSubmit((values) => {
                  console.log(values);
                })}
              >
                <TextInput
                  label="First Name"
                  placeholder="First Name"
                  {...form.getInputProps('firstName')}
                />
                <TextInput
                  label="Last Name"
                  placeholder="Last Name"
                  {...form.getInputProps('lastName')}
                />
                <TextInput label="Email" placeholder="Email" {...form.getInputProps('email')} />
                <TextInput
                  label="Phone Number"
                  placeholder="Phone Number"
                  {...form.getInputProps('phoneNumber')}
                />
                <Select
                  label="Gender"
                  placeholder="Gender"
                  data={genderOptions}
                  {...form.getInputProps('gender')}
                />
                <Select
                  label="Category"
                  placeholder="Category"
                  data={personCategoryOptions}
                  {...form.getInputProps('category')}
                />
                <TextInput
                  label="National ID"
                  placeholder="National ID"
                  {...form.getInputProps('nationalId')}
                />
                <TextInput label="Notes" placeholder="Notes" {...form.getInputProps('notes')} />
                <Group mt={'sm'}>
                  <Checkbox
                    label="WhatsApp Opt In"
                    defaultChecked={userData.whatsappOptIn}
                    {...form.getInputProps('whatsappOptIn')}
                  />
                  <Checkbox
                    label="Is Active"
                    defaultChecked={userData.isActive}
                    {...form.getInputProps('isActive')}
                  />
                </Group>
                <Grid justify="flex-end" mt="md">
                  <Button type="submit">Request</Button>
                </Grid>
              </form>
            </Grid.Col>
          </Grid>
        </>
      )}
    </>
  );
};
