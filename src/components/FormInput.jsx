import { Stack, Input, Text } from 'native-base';
import React from 'react';
import { useController } from 'react-hook-form'; // Import useController

const FormInput = ({ label, placeholder, control, name, rules, errors }) => {
  const { field } = useController({ control, name }); 

  return (
    <Stack space={2} marginTop={'4'} w="100%" maxW="300px">
      <Text>{label}</Text>
      <Input
        variant="outline"
        placeholder={placeholder}
        onChangeText={field.onChange} 
        onBlur={field.onBlur} r
        value={field.value} 
        isInvalid={errors[name]} 
        errorBorderColor="red.500" 
        secureTextEntry={name === 'password'} 
      />
      {errors[name] && (
        <Text color="red.500">{errors[name].message}</Text>
      )}
    </Stack>
  );
};

export default FormInput;
