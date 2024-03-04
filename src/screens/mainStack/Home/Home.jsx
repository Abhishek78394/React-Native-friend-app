import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Chat from '../Chat/Chat';
import Profile from '../Profile/Profile';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import Friend from '../Friend/Friend';

const Tabs = createBottomTabNavigator();

const Home = () => {

  return (
    <Tabs.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({focused, size, color}) => {
        let iconName;
        if (route.name === 'Chat') {
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          return <Ionicons name={iconName} size={30} color={'black'} />;
        } else if (route.name === 'Profile') {
          iconName = focused
            ? 'account-alert'
            : 'account-alert-outline';
            return <Icons name={iconName} size={30} color={'black'} />;
        } else if(route.name === 'MakeFriend'){
          iconName = focused ? 'add-circle' : 'add-circle-outline';
          return <Ionicons name={iconName} size={30} color={'black'} />;
        }
      },
      headerStyle: {
        backgroundColor: '#075e54',
      },
      headerTintColor: 'white',
      tabBarStyle:{ height:60, paddingBottom: 10}
    })}>
      <Tabs.Screen
        name="Chat"
        component={Chat}
       options={{headerShown: false}}
      />
    <Tabs.Screen name="MakeFriend" component={Friend} options={{headerShown: false}} />
    <Tabs.Screen name="Profile" component={Profile} options={{headerShown: false}} />
  </Tabs.Navigator>
  )
}

export default Home