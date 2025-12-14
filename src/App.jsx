import ThreeCanvas from "./components/ThreeCanvas";
import HandTracker from "./components/HandTracker";
import InstructionsOverlay from "./components/InstructionsOverlay";
import DebugInfo from "./components/DebugInfo";

function App() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ThreeCanvas />
      <HandTracker />
      <InstructionsOverlay />
      <DebugInfo />
    </div>
  );
}

export default App;
