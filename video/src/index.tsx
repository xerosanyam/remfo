import { Composition, registerRoot } from 'remotion';
import { RemfoDemo } from './RemfoDemo';

registerRoot(() => <Composition id="RemfoDemo" component={RemfoDemo} durationInFrames={2100} fps={30} width={1920} height={1080} />);
