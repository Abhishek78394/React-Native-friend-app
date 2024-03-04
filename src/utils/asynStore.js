import AsyncStorage from "@react-native-async-storage/async-storage";

// Get Async Storage Data //
export const getAsyncStorageData = async (key) => {
    try {
        const data = await AsyncStorage.getItem(key)
        const parseData = JSON.parse(data)
        return parseData
    } catch (err) {
        console.log(err);
        return err
    }
}
export const getAllDataFromAsyncStorage = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys(); 
      const multiData = await AsyncStorage.multiGet(allKeys); 
      const allData = multiData.map(([key, value]) => ({ key, value: JSON.parse(value) })); 
  
      return allData;
    } catch (error) {
      // Error retrieving data
      console.error('Error retrieving data from AsyncStorage:', error);
      throw error; 
    }
  };

  const saveData = async (userData) => {
    try {
      const serializedUserData = JSON.stringify(userData);
      
      await AsyncStorage.setItem('userData', serializedUserData);
      
      console.log('User data saved successfully');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };


  export const setDataToStorage = async (key, value) => {
    try {
      const data = JSON.stringify(value);
      await AsyncStorage.setItem(key, data);
      return true;
    } catch (error) {
      console.error(`Error setting data to AsyncStorage for key "${key}":`, error);
      return false;
    }
  };

  export const removeDataFromStorage = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      return null;
    }
  };

  export const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      return null;
    }
  };