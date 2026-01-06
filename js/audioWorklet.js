class DummyProcessor extends AudioWorkletProcessor{
  process(){
    return true;
  }
}

registerProcessor("dummy", DummyProcessor);
