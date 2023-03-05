// create by scratch3-extension generator
const ArgumentType = Scratch.ArgumentType;
const BlockType = Scratch.BlockType;
const formatMessage = Scratch.formatMessage;
const log = Scratch.log;

const menuIconURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC3SURBVFhH7ZjRCYQwEAWjpdiJ/4K1CrajRdiAF8gi3qnRAeVWeMOCz8WQISyIFlXXBH+UdnWGtAjSIkiLIC2Ce62h7mNdDKfNxHK7DUfNhNPTslf12H7J/pHko5EnvEpr5tjKm9jXKji28iY0W4S3adkkP4BtkOVQyyb5AWyDLJotgrQI0iJIiyAtgrQIvrXi11mseQqx1mG3uYSfB9Y538yE5OP0tPQDnCAtgrQI0iJIi+BSK4QP7vUMCDXpV1QAAAAASUVORK5CYII=";
const blockIconURI = null;

class SegaFmSynth{
  constructor (runtime){
    this.runtime = runtime;
    // communication related
    this.comm = runtime.ioDevices.comm;
    this.session = null;
    this.runtime.registerPeripheralExtension('SegaFmSynth', this);
    // session callbacks
    this.reporter = null;
    this.onmessage = this.onmessage.bind(this);
    this.onclose = this.onclose.bind(this);
    this.write = this.write.bind(this);
    // string op
    this.decoder = new TextDecoder();
    this.lineBuffer = '';
  }

  onclose (){
    this.session = null;
  }

  write (data, parser = null){
    if (this.session){
      return new Promise(resolve => {
        if (parser){
          this.reporter = {
            parser,
            resolve
          }
        }
        this.session.write(data);
      })
    }
  }

  onmessage (data){
    const dataStr = this.decoder.decode(data);
    this.lineBuffer += dataStr;
    if (this.lineBuffer.indexOf('\n') !== -1){
      const lines = this.lineBuffer.split('\n');
      this.lineBuffer = lines.pop();
      for (const l of lines){
        if (this.reporter){
          const {parser, resolve} = this.reporter;
          resolve(parser(l));
        };
      }
    }
  }

  scan (){
    this.comm.getDeviceList().then(result => {
        this.runtime.emit(this.runtime.constructor.PERIPHERAL_LIST_UPDATE, result);
    });
  }
  getInfo (){
    return {
      id: 'SegaFmSynth',
      name: 'SEGA Genesis FM synthesizer',
      color1: '#474747',
      color2: '#a50d0d',
      menuIconURI: menuIconURI,
      blockIconURI: blockIconURI,
      blocks: [
        {
          opcode: 'SegaFmSynthPad',
          blockType: BlockType.COMMAND,
          arguments: {
            SynthNote: {
              type: ArgumentType.STRING
            },
            SynthTime: {
              type: ArgumentType.STRING
            }
          },
          text: 'Synth Pad note [SynthNote] for [SynthTime] seconds'
        }
      ]
    }
  }

  SegaFmSynthPad (args, util){
    const SynthNote = args.SynthNote;
    const SynthTime = args.SynthTime;

    // Initialize Tone.js
    const synth = new Tone.Synth({
      oscillator: {
        type: "sawtooth"
      },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 1
      }
    }).toDestination();

    // Play Synth Pad sound on specified note and duration
    function play_synth_pad(note, duration) {
      synth.triggerAttackRelease(note, duration);
    }

    play_synth_pad(SynthNote, SynthTime);
  }
}

module.exports = SegaFmSynth;
