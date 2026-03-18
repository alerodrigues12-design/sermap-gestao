/**
 * Serviço para transcrição de áudio usando OpenAI Whisper
 */

import axios from "axios";
import FormData from "form-data";
import { ENV } from "./env";
import fs from "fs";
import path from "path";

const OPENAI_API_KEY = ENV.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1";

/**
 * Transcreve um arquivo de áudio usando Whisper
 */
export async function transcreverAudio(
  audioBuffer: Buffer,
  nomeArquivo: string = "audio.mp3"
): Promise<{
  sucesso: boolean;
  transcricao?: string;
  erro?: string;
}> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("Chave de API OpenAI não configurada");
    }

    // Criar FormData com o arquivo de áudio
    const form = new FormData();
    form.append("file", audioBuffer, nomeArquivo);
    form.append("model", "whisper-1");
    form.append("language", "pt"); // Português
    form.append("temperature", "0"); // Mais preciso

    console.log(`[TranscriptionService] Iniciando transcrição de ${nomeArquivo}...`);

    const response = await axios.post(
      `${OPENAI_API_URL}/audio/transcriptions`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        timeout: 600000, // 10 minutos para arquivos grandes
      }
    );

    if (response.data.text) {
      console.log(`[TranscriptionService] Transcrição concluída com sucesso`);
      return {
        sucesso: true,
        transcricao: response.data.text,
      };
    } else {
      throw new Error("Nenhuma transcrição retornada");
    }
  } catch (error) {
    const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[TranscriptionService] Erro na transcrição:", error);
    return {
      sucesso: false,
      erro: mensagemErro,
    };
  }
}

/**
 * Transcreve um arquivo de áudio a partir de uma URL
 */
export async function transcreverAudioDeUrl(
  audioUrl: string
): Promise<{
  sucesso: boolean;
  transcricao?: string;
  erro?: string;
}> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("Chave de API OpenAI não configurada");
    }

    console.log(`[TranscriptionService] Baixando áudio de ${audioUrl}...`);

    // Baixar o arquivo de áudio
    const response = await axios.get(audioUrl, {
      responseType: "arraybuffer",
      timeout: 300000, // 5 minutos
    });

    const audioBuffer = Buffer.from(response.data);
    const nomeArquivo = audioUrl.split("/").pop() || "audio.mp3";

    console.log(`[TranscriptionService] Áudio baixado (${audioBuffer.length} bytes)`);

    // Transcrever o áudio
    return transcreverAudio(audioBuffer, nomeArquivo);
  } catch (error) {
    const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[TranscriptionService] Erro ao baixar/transcrever áudio:", error);
    return {
      sucesso: false,
      erro: mensagemErro,
    };
  }
}

/**
 * Extrai áudio de um vídeo e transcreve
 * Nota: Requer ffmpeg instalado
 */
export async function transcreverVideoParaAudio(
  videoPath: string
): Promise<{
  sucesso: boolean;
  transcricao?: string;
  erro?: string;
}> {
  try {
    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);

    // Gerar nome do arquivo de áudio
    const audioPath = videoPath.replace(/\.[^/.]+$/, ".mp3");

    console.log(`[TranscriptionService] Extraindo áudio do vídeo...`);

    // Usar ffmpeg para extrair áudio
    await execPromise(
      `ffmpeg -i "${videoPath}" -q:a 9 -n "${audioPath}"`,
      { timeout: 600000 } // 10 minutos
    );

    console.log(`[TranscriptionService] Áudio extraído: ${audioPath}`);

    // Ler o arquivo de áudio
    const audioBuffer = fs.readFileSync(audioPath);

    // Transcrever
    const resultado = await transcreverAudio(audioBuffer, path.basename(audioPath));

    // Limpar arquivo de áudio temporário
    fs.unlinkSync(audioPath);

    return resultado;
  } catch (error) {
    const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[TranscriptionService] Erro ao transcrever vídeo:", error);
    return {
      sucesso: false,
      erro: mensagemErro,
    };
  }
}
