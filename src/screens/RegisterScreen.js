import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { auth } from "../config/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  
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

    // Atualiza o nome do usuário no Firebase
    await updateProfile(userCredential.user, { displayName: nome });

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
      default:
        mensagemErro = "❗ Ocorreu um erro inesperado. Tente novamente.";
        break;
    }

    alert(mensagemErro);
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={require('../../assets/tugacriança.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}><Text style={{ fontWeight: 'bold' }}>MY</Text> <Text style={{ color: '#00aaff' }}>GLUCO</Text></Text>
        <Text style={styles.welcome}>Crie sua conta</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#000" />
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            onChangeText={setNome}
            value={nome}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#000" />
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#000" />
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            secureTextEntry
            onChangeText={setSenha}
            value={senha}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#000" />
          <TextInput
            style={styles.input}
            placeholder="Confirme sua senha"
            secureTextEntry
            onChangeText={setConfirmarSenha}
            value={confirmarSenha}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.login}>Entrar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.or}>OU</Text>
        <Text style={styles.socialText}>Cadastre-se com uma rede social</Text>

        <View style={styles.socialIcons}>
          <FontAwesome name="facebook" size={30} color="#3b5998" />
          <FontAwesome name="google" size={30} color="#DB4437" />
          <FontAwesome name="apple" size={30} color="#000" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f4efef',
  },
  logo: {
    width: 140,
    height: 140,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  welcome: {
    color: '#6a4a4a',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a0a0a0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 15,
    width: '100%',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#00ff0dff',
    borderRadius: 20,
    marginTop: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#081b03ff',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#000',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  login: {
    color: '#a44',
    fontWeight: 'bold',
  },
  or: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  socialText: {
    marginTop: 5,
  },
  socialIcons: {
    flexDirection: 'row',
    marginTop: 10,
    width: '60%',
    justifyContent: 'space-around',
  },
});
