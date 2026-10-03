import { OptimizerConfig, OptimizationResult } from '../types/optimizer';

/**
 * Helper to XOR-encrypt a string and return hex string
 */
export function xorEncryptString(str: string, key: number = 0x5a): string {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    bytes.push((charCode ^ key).toString(16).padStart(2, '0'));
  }
  return bytes.join('');
}

/**
 * Base64 encode helper
 */
export function base64EncodeString(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return btoa(str);
  }
}

/**
 * Checks whether a string literal is deemed sensitive (URLs, tokens, SQL, paths, keys)
 */
export function isSensitiveString(str: string): boolean {
  if (str.length <= 1) return false;
  const lower = str.toLowerCase();
  return (
    lower.includes('http://') ||
    lower.includes('https://') ||
    lower.includes('api/') ||
    lower.includes('v1') ||
    lower.includes('v2') ||
    lower.includes('v3') ||
    lower.includes('v4') ||
    lower.includes('token') ||
    lower.includes('auth') ||
    lower.includes('secret') ||
    lower.includes('pass') ||
    lower.includes('bearer') ||
    lower.includes('user') ||
    lower.includes('key') ||
    lower.includes('sql') ||
    lower.includes('select ') ||
    lower.includes('insert ') ||
    lower.includes('update ') ||
    lower.includes('delete ') ||
    lower.includes('127.0.0.1') ||
    lower.includes('localhost') ||
    lower.includes('.db') ||
    lower.includes('.json') ||
    lower.includes('admin') ||
    str.includes('/')
  );
}

/**
 * Performs Dead-Code Elimination and String Obfuscation on Smali source text
 */
export function optimizeSmaliCode(
  className: string,
  rawSmali: string,
  config: OptimizerConfig
): OptimizationResult {
  const lines = rawSmali.split('\n');
  const originalInstructionCount = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('#')).length;

  let debugLinesRemoved = 0;
  let deadInstructionsStripped = 0;
  let stringsObfuscatedCount = 0;
  const obfuscatedDetails: { original: string; obfuscated: string; mode: string }[] = [];

  const processedLines: string[] = [];
  let isInsideUnreachableBlock = false;
  let currentMethodHasReturn = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Reset method state
    if (trimmed.startsWith('.method ')) {
      isInsideUnreachableBlock = false;
      currentMethodHasReturn = false;
      processedLines.push(line);
      continue;
    }

    if (trimmed === '.end method') {
      isInsideUnreachableBlock = false;
      currentMethodHasReturn = false;
      processedLines.push(line);
      continue;
    }

    // 1. Dead-Code Elimination: Strip debug line markers (.line \d+, .prologue, .local)
    if (config.stripDebugLines) {
      if (
        trimmed.startsWith('.line ') ||
        trimmed === '.prologue' ||
        trimmed.startsWith('.local ')
      ) {
        debugLinesRemoved++;
        deadInstructionsStripped++;
        continue;
      }
    }

    // 2. Dead-Code Elimination: Strip logging calls (Log.d, Log.v, Log.i, Log.w, Log.e)
    if (config.stripLogging) {
      if (
        trimmed.includes('Landroid/util/Log;->d(') ||
        trimmed.includes('Landroid/util/Log;->v(') ||
        trimmed.includes('Landroid/util/Log;->i(') ||
        trimmed.includes('Landroid/util/Log;->w(') ||
        trimmed.includes('Landroid/util/Log;->e(')
      ) {
        deadInstructionsStripped++;
        // Replace with commented note
        processedLines.push(`    # [DCE Optimizer] Stripped Android Log statement`);
        continue;
      }
    }

    // 3. Dead-Code Elimination: Unreachable instructions after return / throw up to next label
    if (config.eliminateUnreachableInstructions) {
      if (
        trimmed.startsWith('return-void') ||
        trimmed.startsWith('return ') ||
        trimmed.startsWith('return-object ') ||
        trimmed.startsWith('throw ')
      ) {
        processedLines.push(line);
        currentMethodHasReturn = true;
        isInsideUnreachableBlock = true;
        continue;
      }

      if (isInsideUnreachableBlock) {
        // Labels or annotations exit the unreachable block
        if (trimmed.startsWith(':') || trimmed.startsWith('.')) {
          isInsideUnreachableBlock = false;
          processedLines.push(line);
        } else {
          // Dead instruction eliminated!
          deadInstructionsStripped++;
          continue;
        }
        continue;
      }
    }

    // 4. String Obfuscation
    if (config.obfuscateStrings) {
      const constStringMatch = trimmed.match(/^const-string(\/jumbo)?\s+([vp]\d+),\s*"([^"]*)"$/);
      if (constStringMatch) {
        const jumbo = constStringMatch[1] || '';
        const reg = constStringMatch[2];
        const strVal = constStringMatch[3];

        const shouldObfuscate =
          config.targetStringsCategory === 'all' || isSensitiveString(strVal);

        if (shouldObfuscate && strVal.length > 0) {
          stringsObfuscatedCount++;

          if (config.stringObfuscationMode === 'xor') {
            const encryptedHex = xorEncryptString(strVal, config.xorKey);
            obfuscatedDetails.push({
              original: strVal,
              obfuscated: encryptedHex,
              mode: `XOR-0x${config.xorKey.toString(16).toUpperCase()}`,
            });

            const indent = line.slice(0, line.indexOf('const-string'));
            processedLines.push(`${indent}# [String Obfuscation] Protected literal via XOR Cipher`);
            processedLines.push(`${indent}const-string${jumbo} ${reg}, "${encryptedHex}"`);
            processedLines.push(
              `${indent}invoke-static {${reg}}, Lcom/security/StringDecryptor;->xor(Ljava/lang/String;)Ljava/lang/String;`
            );
            processedLines.push(`${indent}move-result-object ${reg}`);
            continue;
          } else if (config.stringObfuscationMode === 'base64') {
            const b64 = base64EncodeString(strVal);
            obfuscatedDetails.push({
              original: strVal,
              obfuscated: b64,
              mode: 'Base64+Salt',
            });

            const indent = line.slice(0, line.indexOf('const-string'));
            processedLines.push(`${indent}# [String Obfuscation] Protected literal via Base64 Salt`);
            processedLines.push(`${indent}const-string${jumbo} ${reg}, "${b64}"`);
            processedLines.push(
              `${indent}invoke-static {${reg}}, Lcom/security/StringDecryptor;->b64(Ljava/lang/String;)Ljava/lang/String;`
            );
            processedLines.push(`${indent}move-result-object ${reg}`);
            continue;
          }
        }
      }
    }

    processedLines.push(line);
  }

  const optimizedSmali = processedLines.join('\n');
  const optimizedInstructionCount = processedLines.filter(
    l => l.trim().length > 0 && !l.trim().startsWith('#')
  ).length;

  const originalBytes = new TextEncoder().encode(rawSmali).length;
  const optimizedBytes = new TextEncoder().encode(optimizedSmali).length;
  const bytesSaved = Math.max(0, originalBytes - optimizedBytes);

  return {
    className,
    originalSmali: rawSmali,
    optimizedSmali,
    originalInstructionCount,
    optimizedInstructionCount,
    deadInstructionsStripped,
    stringsObfuscatedCount,
    debugLinesRemoved,
    bytesSaved,
    obfuscatedStringDetails: obfuscatedDetails,
  };
}
