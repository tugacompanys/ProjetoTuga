import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Estado para loading

  const handleLogin = async () => {
    if (!email || !senha) {
      alert("⚠️ Preencha todos os campos para continuar.");
      return;
    }

    setLoading(true); // ✅ inicia o loop

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigation.navigate("HomeScreen", { user: auth.currentUser });
      // 🔴 Deixa o spinner visível por 1 segundo
setTimeout(() => {
  navigation.navigate("HomeScreen", { user: auth.currentUser });
  setLoading(false);
}, 1000);
    } catch (error) {
      let mensagemErro = "❗ Ocorreu um erro inesperado. Tente novamente.";

      switch (error.code) {
        case "auth/invalid-email":
          mensagemErro = "📧 O e-mail informado é inválido.";
          break;
        case "auth/user-disabled":
          mensagemErro = "🚫 Esta conta foi desativada.";
          break;
        case "auth/user-not-found":
          mensagemErro = "❌ Nenhuma conta encontrada com este e-mail.";
          break;
        case "auth/wrong-password":
          mensagemErro = "🔒 Senha incorreta. Verifique e tente novamente.";
          break;
      }

      alert(mensagemErro);
    } finally {
      setLoading(false); // ✅ para o loop
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/tugacriança.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.appName}><Text style={{ fontWeight: 'bold' }}>MY</Text> <Text style={{ color: '#00aaff' }}>GLUCO</Text></Text>
      <Text style={styles.welcome}>Seja Bem-Vindo</Text>

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
          secureTextEntry={!mostrarSenha}
          onChangeText={setSenha}
          value={senha}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setMostrarSenha(!mostrarSenha)}
        >
          <Ionicons
            name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => alert('Esqueci a senha clicado')}>
        <Text style={styles.forgot}>Esqueci a senha</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={handleLogin} 
        disabled={loading} // ✅ desabilita enquanto carrega
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" /> // ✅ spinner
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text>Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.register}>Inscrever-se</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.or}>OU</Text>
      <Text style={styles.socialText}>Inscreva-se com uma rede social</Text>

      <View style={styles.socialIcons}>
        <FontAwesome name="facebook" size={30} color="#3b5998" />
        <FontAwesome name="google" size={30} color="#DB4437" />
        <FontAwesome name="apple" size={30} color="#000" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#f4efef',
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    width: 160,
    height: 160,
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
    marginTop: 20,
    width: '100%',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 10,
  },
  forgot: {
    color: '#a44',
    alignSelf: 'flex-end',
    marginTop: 10,
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
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  register: {
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
  eyeButton: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
});
