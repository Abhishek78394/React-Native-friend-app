import { Item, Input, Text, Stack, Icon } from 'native-base';
import React from 'react';
import { Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const PasswordInput = ({ label, placeHolder, value, onChangeText, secureTextEntry }) => {
  const [show, setShow] = React.useState(false);
  return (
    <Stack space={4} w="85%" maxW="300px" mx="auto" >
      <Text>{label}</Text>
      <Input type={show ? "text" : "password"} InputRightElement={<Pressable onPress={() => setShow(!show)}>
            <Icon as={<MaterialIcons name={show ? "visibility" : "visibility-off"} />} size={5} mr="2" color="muted.400" />
          </Pressable>} placeholder="Password" />
    </Stack>
  );
};

export default PasswordInput;
