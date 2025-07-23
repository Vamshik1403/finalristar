import React from 'react';
import SidebarWithHeader from '../components/Sidebar';
import AddressBook from './AddressBook';

export default function Customers() {
  return (
    <SidebarWithHeader>
      <AddressBook />
    </SidebarWithHeader>
  );
}