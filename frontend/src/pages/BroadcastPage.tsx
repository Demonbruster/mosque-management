import { Button, Container, Group, Title } from '@mantine/core';
import React, { useEffect, useState } from 'react';

export default function BroadcastPage() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(
          `https://dash.whatsflow.app/api/wpbox/getContacts?token=274|o7XTpvDUpfyY8BzA9kMD3qbzASUTc4DZ3huKeAEJ108496c1&showContacts=no`,
        );
        const result = await response.json();
        console.log(result);
        setContacts(result.contacts);
      } catch (error) {
        console.log(error);
      }
    };
    fetchContacts();
  }, []);

  const sendMessageOneByOne = async () => {
    contacts.forEach(async (contact: any) => {
      console.log('Message sent to', contact.phone);
      try {
        const formdata = new FormData();
        formdata.append('token', '274|o7XTpvDUpfyY8BzA9kMD3qbzASUTc4DZ3huKeAEJ108496c1');
        formdata.append('phone', contact.phone);
        formdata.append('message', 'Hello from Mosque Management System');

        const requestOptions: RequestInit = {
          method: 'POST',
          body: formdata,
          redirect: 'follow',
        };

        fetch('https://dash.whatsflow.app/api/wpbox/sendmessage', requestOptions)
          .then((response) => response.json())
          .then((result) => console.log(result))
          .catch((error) => console.log('error', error));
      } catch (error) {
        console.log(error);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  };

  console.log('contacts', contacts);

  return (
    <>
      <Container size="lg" py="xl">
        <Group justify="space-between" mb="lg">
          <Title order={2}>Broadcasts</Title>
        </Group>

        <Button onClick={sendMessageOneByOne}>Send Message One by One</Button>
      </Container>
    </>
  );
}
