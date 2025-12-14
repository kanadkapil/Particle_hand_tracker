import ThreeCanvas from "./components/ThreeCanvas";
import HandTracker from "./components/HandTracker";

function App() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ThreeCanvas />
      <HandTracker />
    </div>
  );
}

export default App;
