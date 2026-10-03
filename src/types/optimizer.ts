export interface OptimizerConfig {
  preset: 'max_shrink' | 'max_hardening' | 'safe';
  stripDebugLines: boolean; // .line, .local, .prologue
  stripLogging: boolean; // Log.d, Log.v, Log.i
  eliminateUnusedMethods: boolean;
  eliminateUnreachableInstructions: boolean;
  obfuscateStrings: boolean;
  stringObfuscationMode: 'xor' | 'base64' | 'array_pool';
  xorKey: number; // e.g. 0x5A
  targetStringsCategory: 'all' | 'sensitive_only';
}

export interface OptimizationResult {
  className: string;
  originalSmali: string;
  optimizedSmali: string;
  originalInstructionCount: number;
  optimizedInstructionCount: number;
  deadInstructionsStripped: number;
  stringsObfuscatedCount: number;
  debugLinesRemoved: number;
  bytesSaved: number;
  obfuscatedStringDetails: {
    original: string;
    obfuscated: string;
    mode: string;
  }[];
}
