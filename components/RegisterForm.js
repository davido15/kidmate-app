// components/RegisterForm.js
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const RegisterForm = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Parent');

  return (
    <View>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput placeholder="Role" value={role} onChangeText={setRole} />
      <Button title="Register" onPress={() => onRegister({ name, phone, password, role })} />
    </View>
  );
};

export default RegisterForm;
