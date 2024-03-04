import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { clearStorage } from '../../../utils/asynStore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [userImage, setUserImage] = useState('https://i.stack.imgur.com/l60Hf.png');
    const navigation = useNavigation();
    const [imagedata, setImagedata] = useState(null);

    useEffect(() => {
        getuserData();
    }, []);

    const getuserData = async () => {
        try {
            const user = await AsyncStorage.getItem('user');
            const userData = JSON.parse(user);
            const doc = await firestore().collection('users').doc(userData.uid).get();
            if (doc.exists) {
                const userData = doc.data();
                console.log(userData)
                setUserData(userData);
                if (userData.photoURL) {
                    setUserImage(userData.photoURL);
                }
            } else {
                console.log('User profile not found!');
            }
        } catch (error) {
            console.log('Error getting user profile:', error);
        }
    };

    const chooseImageFromLibrary = () => {
        launchImageLibrary({ mediaType: 'photo' }, response => {
            if (!response.didCancel) {
                setUserImage(response.assets[0].uri);
                uploadImage(response.assets[0].uri);
            }
        });
    };

    const uploadImage = async (imageData) => {
        try {
            
            const user = JSON.parse(await AsyncStorage.getItem('user'));
            const reference = storage().ref(`user_images/${user.uid}`);
            const pathToFile = imageData;
            await reference.putFile(pathToFile);
            const imageUrl = await reference.getDownloadURL();
            await firestore().collection('users').doc(user.uid).update({ photoURL: imageUrl });
            console.log('Image uploaded successfully!');
        } catch (error) {
            console.log('Error uploading image:', error);
        }
    };

    const logout = async () => {
        const isSignedIn = await GoogleSignin.isSignedIn();

        if (isSignedIn) {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
          console.log('Google logout successful');
        }
    
        await clearStorage();
        navigation.navigate('Login');
    
    };


    return (
        <View style={Profilestyle.maincontainer}>
            <View style={Profilestyle.childcontainer}>
                <View style={Profilestyle.Profile}>
                    <TouchableOpacity
                        style={Profilestyle.Innerprofile}
                        onPress={chooseImageFromLibrary}>
                        <Image
                            style={{ height: '100%', width: '100%', borderRadius: 50 }}
                            source={{ uri: userImage }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: 12 }} onPress={chooseImageFromLibrary}>
                        <Text>Upload Image</Text>
                    </TouchableOpacity>
                </View>
                <View style={Profilestyle.Information}>
                    <Text style={Profilestyle.details}>Name: {userData?.name}</Text>
                    <Text style={Profilestyle.details}>Email: {userData?.email}</Text>
                </View>
                <View style={Profilestyle.buttonBox}>
                    <TouchableOpacity onPress={logout}>
                        <View style={Profilestyle.button}>
                            <Text style={{ color: '#fff', alignSelf: 'center' }}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Profile;

const Profilestyle = StyleSheet.create({
    maincontainer: {
        flex: 1,
        backgroundColor: '#ece5dd',
        justifyContent: 'center',
    },
    childcontainer: {
        height: 650,
    },
    Profile: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 50
    },
    Innerprofile: {
        width: 120,
        height: 120,
        borderWidth: 2,
        borderRadius: 60,
        overflow: 'hidden'
    },
    Information: {
        padding: 20,
    },
    details: {
        fontSize: 20,
        marginBottom: 15,
        color: 'black',
    },
    buttonBox: {
        height: 200,
    },
    button: {
        paddingVertical: 10,
        backgroundColor: 'blue',
        color: 'white',
        width: '50%',
        borderRadius: 7,
        marginLeft: '25%',
        marginTop: '22%',
    }
});
