import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; 

export default function App() {
  const [recording, setRecording] = React.useState();
  const [recordings, setRecordings] = React.useState([]);
  const [message, setMessage] = React.useState("");

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        });
        
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );

        setRecording(recording);
      } else {
        setMessage("Please grant permission to app to access microphone");
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();

    let updatedRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    updatedRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI()
    });

    setRecordings(updatedRecordings);
  }

  function getDurationFormatted(millis) {
    const minutes = millis / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutesDisplay}:${secondsDisplay}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>Recording {index + 1} - {recordingLine.duration}</Text>
          <MaterialIcons name='replay' size={50} onPress={() => recordingLine.sound.setPositionAsync(0) && recordingLine.sound.stopAsync()} color={'pink'}></MaterialIcons>

          <Ionicons name= 'pause-circle-sharp' size={50} color={'pink'} onPress={() => recordingLine.sound.pauseAsync()}></Ionicons>
          <Ionicons name='play-circle-sharp' size={50} color={'pink'} onPress={() => recordingLine.sound.playAsync() } ></Ionicons>
          

        </View>
      );
    });
  }

  return (
    <View style={styles.container}>
    <Text style={styles.text}>RECORDING APP</Text>
      <Text>{message}</Text>
      <Ionicons
      name='md-mic-sharp'
      style={styles.mic}
        color={recording ? 'red' : 'black'}
        size={100}
        onPress={recording ? stopRecording : startRecording} />
      {getRecordingLines()}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: 'gray',
    borderWidth: 0.5,
    backgroundColor: 'snow',
    margin: 10,
    borderRadius: 5,
    elevation: 20
  },
  fill: {
    flex: 1,
    margin: 16,
    fontWeight: 'bold'
  },
  mic: {
    alignContent: 'center',
    justifyContent: 'center'
  },
  text: {
    flex: 1,
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 50
  },
  button: {
    margin: 16
  }
});