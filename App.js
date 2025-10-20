import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileSetupScreen from "./src/screens/ProfileSetupScreen";
import IndiceDiarioScreen from "./src/screens/IndiceDiarioScreen";
import RegistroMedicamentoScreen from "./src/screens/RegistroMedicamentoScreen";
import EditarPerfil from "./src/screens/EditarPerfil";
import Configurações from "./src/screens/Configuracoes";
import Glicemia from "./src/screens/Glicemia";
import Refeicao from "./src/screens/Refeicao";
import Exercicio from "./src/screens/Exercicio";
import Alimento from "./src/screens/alimento";
import InicioRefeicaoScreen from "./src/screens/InicioRefeicao";

import { corrigirIcone } from "./corrigirIcone";

const Stack = createNativeStackNavigator();

export default function App() {
  // roda só uma vez quando abrir
  corrigirIcone();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        // 🔑 CONFIGURAÇÃO GLOBAL DE TRANSIÇÃO
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right", // 👉 Transição padrão para todas as telas
          gestureEnabled: true,          // Permite arrastar para voltar (iOS e Android)
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          // aqui podemos sobrescrever caso precise
          options={{ animation: "fade" }} // Exemplo: splash com fade
        />

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false, title: "Registrar" }}
        />

        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Perfil"
          component={ProfileSetupScreen}
          options={{ headerShown: true, title: "Seu plano" }}
        />

        <Stack.Screen
          name="IndiceDiario"
          component={IndiceDiarioScreen}
          options={{ headerShown: true, title: "Índice Diário" }}
        />

        <Stack.Screen
          name="RegistroMedicamento"
          component={RegistroMedicamentoScreen}
          options={{ headerShown: true, title: "Registrar Medicamentos" }}
        />

        <Stack.Screen
          name="EditarPerfil"
          component={EditarPerfil}
          options={{ headerShown: false, title: "Editar Perfil" }}
        />

        <Stack.Screen
          name="Configurações"
          component={Configurações}
          options={{ headerShown: true, title: "Configurações" }}
        />

        <Stack.Screen
          name="Glicemia"
          component={Glicemia}
          // 👉 aqui mantemos uma animação específica se quiser diferente
          options={{
            headerShown: false,
            title: "Glicemia"
          }}
        />

        <Stack.Screen
          name="Refeicao"
          component={Refeicao}
          options={{ headerShown: false, title: "Refeição"}}
        />

        <Stack.Screen
          name="Exercicio"
          component={Exercicio}
          options={{ headerShown: false, title: "Exercício" }}
        />

        <Stack.Screen
        name="Alimento"
        component={Alimento}
        options={{ headerShown: false, title: "Detalhes do Alimento" }}
       />
               <Stack.Screen
          name="Refeicao_inicio"
          component={InicioRefeicaoScreen}
          options={{ headerShown: false, title: "Refeição"}}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
