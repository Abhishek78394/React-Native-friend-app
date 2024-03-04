import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image,Alert, TouchableOpacity, StyleSheet, Dimensions, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore, { firebase } from '@react-native-firebase/firestore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Spacing from '../../../constants/Spacing';
import Icon from 'react-native-vector-icons/FontAwesome';
import { calculateDistance } from '../../../utils/location';

const Friend = () => {
    const [users, setUsers] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [getuser, setGetUser] = useState(false);
    const navigation = useNavigation();
    const isFocused = useIsFocused();


    const getUsers = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('user');
            const userData = JSON.parse(userDataString) || {};
            const currentUserUid = userData.uid;
    
            const friendsSnapshot = await firestore()
                .collection("friends")
                .doc(currentUserUid)
                .collection("myFriends")
                .get();
            const friendUids = friendsSnapshot.docs.map(doc => doc.data().friendUid);
    
            const querySnapshot = await firestore()
                .collection("users")
                .where("email", "!=", userData.email)
                .get();
            const users = querySnapshot.docs.map(doc => doc.data());
    
            // Query friend requests sent by the current user
            const sentRequestsSnapshot = await firestore()
                .collection("friendRequests")
                .doc(currentUserUid)
                .collection("sent")
                .get();
            const sentRequests = sentRequestsSnapshot.docs.map(doc => doc.id);
    
            // Query friend requests received by the current user
            const receivedRequestsSnapshot = await firestore()
                .collection("friendRequests")
                .doc(currentUserUid)
                .collection("received")
                .get();
            const receivedRequests = receivedRequestsSnapshot.docs.map(doc => doc.id);
    
            // Calculate distances and add requestStatus
            const sortedUsers = users.map(user => {
                const requestStatus = receivedRequests.includes(user.uid) ? "pending" : (sentRequests.includes(user.uid) ? "sent" : "none");
                if (userData.location && user.location) {
                    const distance = calculateDistance(userData.location.latitude, userData.location.longitude, user.location.latitude, user.location.longitude);
                    return { ...user, distance, requestStatus };
                } else {
                    return { ...user, distance: null, requestStatus };
                }
            }).sort((a, b) => a.distance - b.distance);
    
            // Filter out friends and apply search filter
            const filteredUsers = sortedUsers.filter(user =>
                !friendUids.includes(user.uid) && user.name.toLowerCase().includes(searchValue.toLowerCase())
            );
    
            setGetUser(false);
            setUsers(filteredUsers);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    
    
    const addFriend = async (friendUid) => {
        try {
            const userDataString = await AsyncStorage.getItem('user');
            const userData = JSON.parse(userDataString) || {};
            const currentUserUid = userData.uid;
    
            // Add friend request to sender's requestsSent collection
            await firestore()
                .collection("friendRequests")
                .doc(currentUserUid)
                .collection("sent")
                .doc(friendUid)
                .set({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() 
                });
    
            // Add friend request to recipient's requestsReceived collection
            await firestore()
                .collection("friendRequests")
                .doc(friendUid)
                .collection("received")
                .doc(currentUserUid)
                .set({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() 
                });
    
            console.log("Friend request sent successfully!");
            setGetUser(true);
            Alert.alert('Success', 'Friend request sent successfully');
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    };
    
    const acceptFriendRequest = async (friendUid) => {
        try {
            const userDataString = await AsyncStorage.getItem('user');
            const userData = JSON.parse(userDataString) || {};
            const currentUserUid = userData.uid;
    
            // Update the friend request status to "accepted" for both users
            await firestore()
                .collection("friendRequests")
                .doc(currentUserUid)
                .collection("received")
                .doc(friendUid)
                .delete(); // Delete the received request
            await firestore()
                .collection("friendRequests")
                .doc(friendUid)
                .collection("sent")
                .doc(currentUserUid)
                .delete(); // Delete the sent request
    
            // Add both users as friends
            await firestore()
                .collection("friends")
                .doc(currentUserUid)
                .collection("myFriends")
                .doc()
                .set({
                    friendUid: friendUid
                });
            await firestore()
                .collection("friends")
                .doc(friendUid)
                .collection("myFriends")
                .doc()
                .set({
                    friendUid: currentUserUid
                });
    
            console.log("Friend request accepted successfully!");
            Alert.alert("Success","Friend request accepted successfully!");
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };

    useEffect(() => {
        if (isFocused) {
            getUsers();
        }
    }, [isFocused, searchValue,getuser]);



  return (
      <View style={friendStyle.container}>
          <View style={{ paddingHorizontal: 5 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcfcf1', borderRadius: Spacing }}>
                  <TextInput
                      style={{ flex: 1, padding: 10, borderColor: 'gray', borderRadius: 5 }}
                      placeholder="Search"
                      value={searchValue}
                      onChangeText={(text) => setSearchValue(text)}
                  />
                  <TouchableOpacity onPress={getUsers}>
                      <Icon name="search" size={20} color="black" style={{ padding: 8 }} />
                  </TouchableOpacity>
              </View>
          </View>
          {users.length === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text>No users found</Text>
              </View>
          ) : (
              <FlatList
                  data={users}
                  renderItem={({ item }) => (
                      <View style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: 'center',
                          flexDirection: "row",
                          borderBottomWidth: 0.2,
                      }} >
                          <View style={friendStyle.list}>
                              <View style={friendStyle.Icon}>
                                  <Image
                                      style={friendStyle.Image}
                                      source={item.photoURL ? { uri: item.photoURL } : { uri: "https://i.stack.imgur.com/l60Hf.png" }}
                                  />
                              <View style={friendStyle.dot}>
                                  <Text style={{color: 'green'}}>{item.distance}</Text>
                              </View>
                              </View>


                              <Text style={friendStyle.username}>{item.name}</Text>
                          </View>
                          <View style={item.requestStatus === "sent" ? friendStyle.sentButton :  item.requestStatus === "pending" ? friendStyle.ConfimButton : friendStyle.addButton  }>
                              {
                                  item.requestStatus === 'sent' ? (
                                      <Text style={{ textAlign: 'center', fontSize: 10, color: 'blue' }}>Sent</Text>
                                  ) : item.requestStatus === "pending" ? (
                                      <TouchableOpacity onPress={() => acceptFriendRequest(item.uid)}>
                                          <Text style={{ textAlign: 'center', fontSize: 10, color: '#fff' }}>Confirm</Text>
                                      </TouchableOpacity>
                                  ) : (
                                      <TouchableOpacity onPress={() => addFriend(item.uid)}>
                                          <Text style={{ textAlign: 'center', fontSize: 10, color: '#fff' }}>Add</Text>
                                      </TouchableOpacity>
                                  )
                              }
                          </View>

                      </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
              />
          )}
      </View>
  
  )
}

export default Friend


const friendStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ece5dd"
    },ConfimButton: {
        width: Dimensions.get("window").width * 1 / 6,
        backgroundColor: 'green',
        padding: Spacing ,
        alignSelf:'center',
        borderRadius: 10,
        marginRight: 10,
    },
    addButton: {
        width: Dimensions.get("window").width * 1 / 8,
        backgroundColor: '#0C3D6E',
        padding: Spacing ,
        alignSelf:'center',
        borderRadius: 10,
        marginRight: 10,
        
    },sentButton: {
        width: Dimensions.get("window").width * 1 / 8,
        backgroundColor: '#FFF',
        padding: Spacing ,
        borderColor: 'blue',
        borderWidth: 1,
        alignSelf:'center',
        borderRadius: 10,
        marginRight: 10,
    },
    list: {
      width: Dimensions.get("window").width * 4 / 5,
      alignSelf: "center",
      borderRadius: 20,
      flexDirection: "row",
      height: 60,
      marginTop: 10,
      alignItems: "center",
      paddingLeft: 20,
    },
    Icon: {
      width: 40,
      height: 40,
      objectFit: "cover"
    },
    Image: {
      width: "100%",
      height: "100%",
      borderRadius: 50
    },
    username: {
      color: "black",
      fontSize: 30,
      marginLeft: 20
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        position: "absolute",
        top: -10
    }
  });
  