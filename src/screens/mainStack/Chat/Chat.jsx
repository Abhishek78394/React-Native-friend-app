import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Spacing from '../../../constants/Spacing';
import Icon from 'react-native-vector-icons/FontAwesome';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [id, setId] = useState();

  const getUsers = async () => {
    try {
        const userDataString = await AsyncStorage.getItem('user');
        const userData = JSON.parse(userDataString) || {};
        const currentUserUid = userData.uid;
console.log(userData,"userdayd is jhe5sv")
        const friendsSnapshot = await firestore()
            .collection("friends")
            .doc(currentUserUid)
            .collection("myFriends")
            .get();
        const friendUids = friendsSnapshot.docs.map(doc => doc.data().friendUid);

        const usersWithLastMessageTime = await Promise.all(
            friendUids.map(async (friendUid) => {
                const userSnapshot = await firestore()
                    .collection("users")
                    .doc(friendUid)
                    .get();
                const user = userSnapshot.data();

                const lastMessageSnapshot = await firestore()
                    .collection('chats')
                    .doc(currentUserUid + friendUid)
                    .collection('messages')
                    .orderBy('createdAt', 'desc')
                    .limit(1)
                    .get();

                const lastMessage = lastMessageSnapshot.docs[0];
                let lastMessageTime = new Date(0);

                if (lastMessage?.data()?.createdAt) {
                    lastMessageTime = new Date(lastMessage.data().createdAt);
                }

                return { ...user, lastMessageTime };
            })
        );

        usersWithLastMessageTime.sort((a, b) => {
            return b.lastMessageTime - a.lastMessageTime;
        });

        const filteredUsers = usersWithLastMessageTime.filter(user =>
            user.name.toLowerCase().includes(searchValue.toLowerCase())
        );
        setUsers(filteredUsers);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};



  useEffect(() => {
    if (isFocused) {
      getUsers();
    }
  }, [isFocused,searchValue]);




  return (
    <View style={chatstyle.container}>
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
            <TouchableOpacity 
              style={chatstyle.list} 
              onPress={() => navigation.navigate("Message", { data: item, id: id })}
            >
              <View style={chatstyle.Icon}>
                <Image
                  style={chatstyle.Image}
                  source={item.photoURL ? { uri: item.photoURL } : { uri: "https://i.stack.imgur.com/l60Hf.png" }}
                />
              </View>
              <Text style={chatstyle.username}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

export default Chat;

const chatstyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ece5dd"
  },
  list: {
    width: Dimensions.get("window").width,
    alignSelf: "center",
    borderRadius: 20,
    flexDirection: "row",
    borderBottomWidth: 0.2,
    height: 60,
    marginTop: 10,
    alignItems: "center",
    paddingLeft: 20
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
  }
});
