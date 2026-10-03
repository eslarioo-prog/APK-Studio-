export interface LogEntry {
  id: string;
  timestamp: string;
  tag: string;
  level: 'V' | 'D' | 'I' | 'W' | 'E'; // Verbose, Debug, Info, Warn, Error
  pid: number;
  tid: number;
  message: string;
  patchImpactCategory?: 'root' | 'ssl' | 'offline' | 'crash' | 'general';
}

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  condition?: string;
  hitCount: number;
  enabled: boolean;
  status: 'active' | 'hit' | 'disabled';
}

export interface RuntimeVariable {
  name: string;
  type: string;
  value: any;
  scope: 'Local' | 'Instance' | 'Static' | 'Global';
  isModified?: boolean;
}

export interface CallStackFrame {
  id: string;
  methodName: string;
  className: string;
  fileName: string;
  lineNumber: number;
}
