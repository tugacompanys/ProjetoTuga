import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileSetupScreen from "./src/screens/ProfileSetupScreen";
import IndiceDiarioScreen from "./src/screens/IndiceDiarioScreen"; // <== IMPORT CORRETO
import RegistroMedicamentoScreen from './src/screens/RegistroMedicamentoScreen';
import EditarPerfil from "./src/screens/EditarPerfil";
import Configurações from "./src/screens/Configuracoes";
import Glicemia from "./src/screens/Glicemia";
import Refeicao from "./src/screens/Refeicao";
import Exercicio from "./src/screens/Exercicio";
import { corrigirIcone } from "./corrigirIcone";

const Stack = createNativeStackNavigator();

export default function App() {
  // roda só uma vez quando abrir
  corrigirIcone();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Registrar" }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: "Início", headerShown: false }}
        />
        <Stack.Screen name="Perfil"
          component={ProfileSetupScreen}
          options={{ title: "Seu plano" }} />

        <Stack.Screen name="IndiceDiario"
          component={IndiceDiarioScreen}
          options={{ title: "ÍndiceDiario" }} />

         <Stack.Screen
          name="RegistroMedicamento"
          component={RegistroMedicamentoScreen}
          options={{ title: "Registrar Medicamentos" }}
        />

        <Stack.Screen
          name="EditarPerfil"
          component={EditarPerfil}
          options={{ title: "Editar Perfil" }}
        />

        <Stack.Screen
          name="Configurações"
          component={Configurações}
          options={{ title: "Configurações" }}
        />

        <Stack.Screen
          name="Glicemia"
          component={Glicemia}
          options={{title: "Glicemia"}}
        />

        <Stack.Screen
         name="Refeicao"
         component={Refeicao}
         options={{title: "Refeicao"}}
        />

        <Stack.Screen 
        name="Exercicio"
        component={Exercicio}
        options={{title: "Exercicio"}}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
