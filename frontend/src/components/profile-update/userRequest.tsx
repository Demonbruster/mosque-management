import { Button, Checkbox, Grid, Group, Select, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import { genderEnum, personCategoryEnum } from '../../../../backend/src/db/schema';
import { existingUser, userRequests } from '../../../mockdata/userRequests';
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
    validate: {
      firstName: (value) => (value.length < 2 ? 'First name must be at least 2 characters' : null),
      lastName: (value) => (value.length < 2 ? 'Last name must be at least 2 characters' : null),
      email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email'),
      phoneNumber: (value) =>
        value.length < 10 ? 'Phone number must be at least 10 digits' : null,
      nationalId: (value) => (value.length < 10 ? 'National ID must be at least 10 digits' : null),
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

  const handleSubmit = (values: typeof form.values) => {
    try {
      userRequests.push({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        category: values.category,
        nationalId: values.nationalId,
        notes: values.notes,
        whatsappOptIn: values.whatsappOptIn,
        isActive: values.isActive,
        id: userRequests.length + 1,
      });
      setChangeRequest(false);
      form.reset();
    } catch (error) {
      console.log('Error adding request', error);
    }
  };

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
              <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
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
