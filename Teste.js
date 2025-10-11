import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Image, KeyboardAvoidingView, Platform, ScrollView, 
  Animated 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { auth } from "../config/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [image, setImage] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('É necessário permitir o acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      alert("⚠️ Preencha todos os campos para continuar.");
      return;
    }

    if (senha.length < 6) {
      alert("🔒 A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("❌ As senhas não coincidem.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      let photoURL = null;
      if (image) {
        const storage = getStorage();
        const storageRef = ref(storage, `profileImages/${user.uid}.jpg`);
        const response = await fetch(image);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(user, {
        displayName: nome,
        photoURL: photoURL,
      });

      alert(`✅ Usuário ${nome} cadastrado com sucesso!`);
      navigation.navigate("Login");
    } catch (error) {
      let mensagemErro = "Erro ao cadastrar. Tente novamente.";

      switch (error.code) {
        case "auth/invalid-email":
          mensagemErro = "📧 O e-mail informado é inválido.";
          break;
        case "auth/email-already-in-use":
          mensagemErro = "⚠️ Este e-mail já está sendo usado por outra conta.";
          break;
        case "auth/weak-password":
          mensagemErro = "🔒 A senha é muito fraca. Escolha uma senha mais segura.";
          break;
      }

      alert(mensagemErro);
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image 
          source={require('../../assets/tugacriança.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />

        <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
          <Image
            source={image ? { uri: image } : { uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.profileImage}
          />
          <Text style={styles.addPhotoText}>Adicionar foto de perfil</Text>
        </TouchableOpacity>

        <Text style={styles.appName}>
          <Text style={{ fontWeight: 'bold' }}>MY</Text>
          <Text style={{ color: '#00aaff' }}>GLUCO</Text>
        </Text>
        <Text style={styles.welcome}>Crie sua conta</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#00aaff" />
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            onChangeText={setNome}
            value={nome}
            placeholderTextColor="#777"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#00aaff" />
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
            placeholderTextColor="#777"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#00aaff" />
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            secureTextEntry
            onChangeText={setSenha}
            value={senha}
            placeholderTextColor="#777"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#00aaff" />
          <TextInput
            style={styles.input}
            placeholder="Confirme sua senha"
            secureTextEntry
            onChangeText={setConfirmarSenha}
            value={confirmarSenha}
            placeholderTextColor="#777"
          />
        </View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => { animateButton(); handleRegister(); }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.loginText}>
          Já tem uma conta?{' '}
          <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
            Entrar
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#eef5f9',
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#00aaff',
  },
  addPhotoText: {
    color: '#00aaff',
    marginTop: 5,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
  },
  welcome: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.3,
    borderColor: '#cfd8dc',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    width: '100%',
    backgroundColor: '#fff',
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    color: '#000',
  },
  button: {
    backgroundColor: '#00aaff',
    borderRadius: 25,
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 50,
    elevation: 4,
    shadowColor: '#0077cc',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  loginText: {
    marginTop: 15,
    color: '#444',
  },
  linkText: {
    color: '#00aaff',
    fontWeight: 'bold',
  },
});
