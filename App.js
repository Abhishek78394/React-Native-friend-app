import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppStack from './src/navigation/Appstack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const App = () => {
  const [user, setUser] = useState(true);
  const [loading, setloading] = useState(true);
  const [AuthenticatedUser, setAuthenticatedUser] = useState(null);
  const userfromasync = async () => {
    try {
      auth().onAuthStateChanged(userEx => {
        if (userEx?.uid !== AuthenticatedUser?.uid) {
          const userdets = firestore()
            .collection('users')
            .doc(userEx.uid)
            .get()
            .then(res => {
              const filterdata = res.data();
              setAuthenticatedUser(userEx);
              setUser(filterdata)
            });
        } else {
          setUser(null)
        }
      });
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    userfromasync();
  }, []);

  return (
    <View style={{flex: 1}}>
        <AppStack />
    </View>
  );
};

export default App;
