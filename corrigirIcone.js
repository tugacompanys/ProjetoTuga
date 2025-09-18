import * as ImageManipulator from "expo-image-manipulator";

// exporta a função
export async function corrigirIcone() {
  const result = await ImageManipulator.manipulateAsync(
    require("./assets/tugacriança.png"),
    [{ resize: { width: 512, height: 512 } }], // ajusta pra quadrado
    { compress: 1, format: ImageManipulator.SaveFormat.PNG }
  );

  console.log("Novo ícone salvo em:", result.uri);
}

// NÃO chame aqui dentro
// corrigirIcone();
