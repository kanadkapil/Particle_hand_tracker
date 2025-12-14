import ThreeCanvas from "./components/ThreeCanvas";
import HandTracker from "./components/HandTracker";
import InstructionsOverlay from "./components/InstructionsOverlay";

function App() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ThreeCanvas />
      <HandTracker />
      <InstructionsOverlay />
    </div>
  );
}

export default App;
