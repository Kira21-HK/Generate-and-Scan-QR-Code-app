import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  TextInput,
  Button,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-crop-picker';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const QRCodeGenerator = ({ isVisible, onClose, generateQRCode }) => {
  const [inputText, setInputText] = useState('');
  const [qrCodeDataG, setQRCodeData] = useState('');

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Camera permission denied. Cannot scan QR codes.');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const generateQRCodeHandler = () => {
    setQRCodeData(inputText);
    generateQRCode();
  };

  const viewShotRef = useRef();

  const shareGeneratedQRCode = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const shareOptions = {
        title: 'Share Generated QR Code',
        url: `file://${uri}`,
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing generated QR code:', error.message);
    }
  };

  const downloadQRCode = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const destinationPath = `${RNFS.PicturesDirectoryPath}/QRCode_${Date.now()}.png`;
      await RNFS.copyFile(uri, destinationPath);
      Alert.alert('Success', 'QR code image has been downloaded.');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      Alert.alert('Error', 'Failed to download QR code image.');
    }
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
        <Text style={{ marginBottom: 10, textAlign: 'center', color: 'black' }}>QR Code Generator</Text>
        <TextInput
          style={{ marginBottom: 10, padding: 10, borderColor: 'gray', borderWidth: 1, color: 'black' }}
          placeholder="Enter text"
          value={inputText}
          onChangeText={(text) => setInputText(text)}
        />
        <Button title="Generate QR Code" onPress={generateQRCodeHandler} />

        {qrCodeDataG ? (
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1.0 }}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <QRCode value={qrCodeDataG} size={200} />
          </ViewShot>
        ) : (
          <View>
            {/* Placeholder or message if no QR code generated yet */}
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <Button title="Share" onPress={shareGeneratedQRCode} />
          <Button title="Download" onPress={downloadQRCode} />
          <Button title="Cancel" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};

const App = () => {
  const scannerRef = useRef(null);
  const [isGeneratorVisible, setIsGeneratorVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [flashOn, setFlashOn] = useState(false);

  const handleQRCodeRead = (event) => {
    if (event.data) {
      setQrCodeData(event.data);
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setQrCodeData('');
      }, 5000);
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const openImagePicker = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true,
      });

      console.log('Selected Image:', image);
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  const generateQRCode = () => {
    // Logic to generate QR code data
  };

  const openQRCodeGenerator = () => {
    setIsGeneratorVisible(true);
  };

  const closeQRCodeGenerator = () => {
    setIsGeneratorVisible(false);
  };

  useEffect(() => {
    // Check and request camera permissions when the component mounts;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        ref={scannerRef}
        onBarCodeRead={handleQRCodeRead}
        style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}
        flashMode={flashOn ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
        reactivateTimeout={1000}
      >
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            alignSelf: 'center',
            padding: 10,
            backgroundColor: '#7FC7D9',
            borderRadius: 50,
          }}
          onPress={toggleFlash}
        >
          <Image source={require('./assists/flash.png')} style={{ width: 20, height: 20, tintColor: 'white' }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            padding: 10,
            backgroundColor: '#7FC7D9',
            borderRadius: 50,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={openImagePicker}
        >
          <Image source={require('./assists/photo.png')} style={{ width: 20, height: 20, tintColor: 'white' }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            padding: 10,
            backgroundColor: '#7FC7D9',
            borderRadius: 50,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={openQRCodeGenerator}
        >
          <Image source={require('./assists/generator.png')} style={{ width: 20, height: 20, tintColor: 'white' }} />
        </TouchableOpacity>
      </RNCamera>

      <QRCodeGenerator
        isVisible={isGeneratorVisible}
        onClose={closeQRCodeGenerator}
        generateQRCode={generateQRCode}
      />

      <Modal isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
        <View style={{ backgroundColor: 'dark', padding: 20, borderRadius: 10 }}>
          <Text style={{ color: 'white', marginBottom: 10 }}>Scanned Link: {qrCodeData}</Text>
          {/* Option buttons */}
        </View>
      </Modal>
    </View>
  );
};

export default App;
