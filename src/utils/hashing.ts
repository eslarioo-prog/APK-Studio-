import SparkMD5 from 'spark-md5';

export interface FileHashes {
  md5: string;
  sha256: string;
}

export const calculateHashes = async (blob: Blob): Promise<FileHashes> => {
  const arrayBuffer = await blob.arrayBuffer();

  // SHA-256 using subtle crypto
  const sha256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const sha256Array = Array.from(new Uint8Array(sha256Buffer));
  const sha256Hex = sha256Array.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  // MD5 using SparkMD5
  const spark = new SparkMD5.ArrayBuffer();
  spark.append(arrayBuffer);
  const md5Hex = spark.end().toUpperCase();

  return {
    md5: md5Hex,
    sha256: sha256Hex,
  };
};
