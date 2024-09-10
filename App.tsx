import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Voice from '@react-native-voice/voice';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const flatListRef = useRef(); // Ref for FlatList

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = stopListing;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = error => console.log('onSpeechError', error);

    const androidPermissionChecking = async () => {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        console.log(
          'androidPermissionChecking hasPermission : ',
          hasPermission,
        );
        const getService = await Voice.getSpeechRecognitionServices();
        console.log('androidPermissionChecking getService: ', getService);
      }
    };
    androidPermissionChecking();

    // for removing all listener
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = event => {
    console.log('Recording Started...: ', event);
  };

  const onSpeechResults = event => {
    const text = event.value[0];
    setRecognizedText(text);
  };

  const startListing = async () => {
    setIsListening(true);
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.log('Start Listing Error : ', error);
    }
  };

  const stopListing = async () => {
    try {
      await Voice.stop();
      Voice.removeAllListeners();
      setIsListening(false);
    } catch (error) {
      console.log('StopListing Error : ', error);
    }
  };

  const sendMessage = () => {
    if (recognizedText) {
      setMessages(prevMessages => [
        ...prevMessages,
        {text: recognizedText, sender: 'user'},
      ]);
      setRecognizedText('');

      // Scroll to bottom after new message is added
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100); // Delay to ensure the layout is updated before scrolling
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <FlatList
        ref={flatListRef}
        data={messages}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View
            style={[
              styles.messageBubble,
              {
                alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: item.sender === 'user' ? '#BB2525' : '#141E46',
              },
            ]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({animated: true})} // Scroll to bottom when the list size changes
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={recognizedText}
          onChangeText={text => setRecognizedText(text)}
        />
        <TouchableOpacity
          onPress={() => {
            isListening ? stopListing() : startListing();
          }}
          style={styles.voiceButton}>
          {isListening ? (
            <Text style={styles.voiceButtonText}>•••</Text>
          ) : (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/4980/4980251.png',
              }}
              style={{width: 45, height: 45}}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E0',
  },
  messagesContainer: {
    padding: 10,
  },
  messageBubble: {
    maxWidth: '70%',
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
  },
  voiceButton: {
    marginLeft: 10,
    fontSize: 24,
  },
  voiceButtonText: {
    fontSize: 24,
    height: 45,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF6969',
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default App;
