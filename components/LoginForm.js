// components/LoginForm.js
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const LoginForm = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View>
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={() => onLogin({ phone, password })} />
    </View>
  );
};

export default LoginForm;
