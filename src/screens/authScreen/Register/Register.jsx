import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import Spacing from "../../../constants/Spacing";
import { small, xLarge, large, } from "../../../constants/FontSize";
import { primary, onPrimary, text, darkText, gray, background, active } from "../../../constants/Colors";
import Font from "../../../constants/Font";
import AppTextInput from "../../../components/AppTextInput";
import Icons from "react-native-vector-icons/Ionicons";
import FormInput from "../../../components/FormInput";
import PasswordInput from "../../../components/PasswordInput";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from 'react-hook-form';
import auth, {} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { setDataToStorage } from "../../../utils/asynStore";
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import firebase from '@react-native-firebase/app';
import { getCurrentLocation } from "../../../utils/location";

const Register = () => {
  const { control, handleSubmit, formState: { errors }, setValue } = useForm();
  const navigation = useNavigation();
  useEffect(() => {
    GoogleSignin.configure({
      // androidClientId: '521686334194-tonicdk4iasvtch9u81lqlorsqn2h6uo.apps.googleusercontent.com',
      webClientId:
        '521686334194-m1v62pjhj6758mvvt3jr1vens5cvnodu.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('Checking for Play Services');
      await GoogleSignin.hasPlayServices();
      console.log('Play Services available');

      const { idToken } = await GoogleSignin.signIn();
      console.log('Google Sign-in successful:', idToken);

      const googleCredential = firebase.auth.GoogleAuthProvider.credential(idToken);
      const { user } = await firebase.auth().signInWithCredential(googleCredential);
      console.log(user, 'user');

      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      const location = await getCurrentLocation();
      if (!userDoc.exists) {
         let setUser = await firestore().collection('users').doc(user.uid).set({
              name: user.displayName,
              email: user.email,
              uid: user.uid,
              photoURL: user.photoURL,
              location: {
                latitude: location.latitude,
                longitude: location.longitude 
              }
          });
      }
      const doc = await firestore().collection('users').doc(user.uid).get();
      const userData = doc.data();
      setDataToStorage('user', userData);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Google login error:', JSON.stringify(error));
      Alert.alert('Error', error.message);
    }
  };



  const handleFacebookLogin = async () => {
    try {

      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        console.log('Facebook login cancelled');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw new Error('Something went wrong obtaining the access token');
      }

      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

      await auth().signInWithCredential(facebookCredential);
      console.log('Facebook login successful');
    } catch (error) {
      console.error('Error logging in with Facebook:', error);
    }
  };

  const handleRegister = async (data) => {
    try {
      const  {user}  = await auth().createUserWithEmailAndPassword(
        data.email,
        data.password,
      );
      const location = await getCurrentLocation();
     await firestore().collection('users').doc(user.uid).set({
        name: data.name,
        email: data.email,
        uid: user.uid,
        location: {
          latitude: location.latitude,
          longitude: location.longitude 
        }
      });
      const doc = await firestore().collection('users').doc(user.uid).get();
      const userData = doc.data();
      setDataToStorage('user', userData);
      navigation.navigate('Home');

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log("Login Error: " +'That email address is already in use!');
        Alert.alert('Error','That email address is already in use!');
      }else if(error.code === 'auth/invalid-email'){
        console.log("Login Error: " +'That email address is invalid!');
        Alert.alert('Error', 'That email address is invalid!');
      }else{
        console.log("Login Error: " + error.message)
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <SafeAreaView>
      <View style={{ padding: Spacing * 2 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontFamily: Font["poppins-semiBold"], fontSize: 20, maxWidth: "80%", textAlign: "center", color: 'blue', marginVertical: Spacing * 2 }}>
            Create an account
          </Text>
        </View>

        <View style={{ marginVertical: Spacing * 3 }}>
          <View style={{ marginBottom: 10 }}>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Enter your Name' }}
              defaultValue=""
              render={({ field }) => (
                <FormInput
                  label='Name'
                  placeholder='Enter Your Name'
                  control={control}
                  name='name'
                  errors={errors}
                />
              )}
            />
          </View>
          <View style={{ marginBottom: 10 }}>
            <Controller
              control={control}
              name="email"
              rules={{ required: 'Enter your Email' }}
              defaultValue=""
              render={({ field }) => (
                <FormInput
                  label='Email'
                  placeholder='Enter Your Email'
                  control={control}
                  name='email'
                  errors={errors}
                />
              )}
            />
          </View>
          <View style={{ marginBottom: 10 }}>
            <Controller
              control={control}
              name="password"
              rules={{ required: 'Enter your Password' }}
              defaultValue=""
              render={({ field }) => (
                <FormInput
                  label='Password'
                  placeholder='Enter Your Password'
                  control={control}
                  name='password'
                  errors={errors}
                />
              )}
            />
          </View>

          {/* <FormInput label={'Email'} placeholder="Enter Your Email" control={control} name="email" rules={{ required: 'Enter your Email' }} />
          {errors.email && (
            <Text>{errors.email.message}</Text>
          )}

          <FormInput label={'Password'} placeholder="Enter Your Password" control={control} name="password" rules={{ required: 'Enter your Password' }} />
          {errors.password && (
            <Text>{errors.password.message}</Text>
          )} */}
        </View>

        <TouchableOpacity
          onPress={handleSubmit(handleRegister)}
          style={{
            padding: Spacing * 1,
            backgroundColor: primary,
            marginVertical: Spacing * 3,
            borderRadius: Spacing,
            shadowColor: primary,
            shadowOffset: {
              width: 0,
              height: Spacing,
            },
            shadowOpacity: 0.3,
            shadowRadius: Spacing,
          }}
        >
          <Text style={{ fontFamily: Font["poppins-bold"], color: '#fff', textAlign: "center", fontSize: large, paddingVertical: Spacing * 1, borderRadius: Spacing, backgroundColor: '#9277EB' }}>
            Sign up
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontFamily: Font["poppins-semiBold"], color: text, textAlign: "center", fontSize: small }}>
            Already have an account
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{ padding: Spacing }}
          >
            <Text style={{ fontFamily: Font["poppins-semiBold"], color: "blue", textAlign: "center", fontSize: small }}>
              Login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginVertical: Spacing * 3 }}>
          <Text style={{ fontFamily: Font["poppins-semiBold"], color: primary, textAlign: "center", fontSize: small }}>
            Or continue with
          </Text>

          <View style={{ width: '100%', flexDirection: "row", justifyContent: "center" }}>
            <View style={{ marginTop: Spacing, flexDirection: "row", justifyContent: "space-between", width: '60%' }}>
              <TouchableOpacity style={{ padding: Spacing, backgroundColor: gray, borderRadius: Spacing / 2, marginHorizontal: Spacing }} onPress={signInWithGoogle}>
                <Icons name="logo-google" color={text} size={Spacing * 2} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleFacebookLogin} style={{ padding: Spacing, backgroundColor: gray, borderRadius: Spacing / 2, marginHorizontal: Spacing }}>
                <Icons name="logo-facebook" color={text} size={Spacing * 2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Register;
