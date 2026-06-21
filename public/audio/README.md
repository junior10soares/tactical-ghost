# Banco de efeitos sonoros

Esta pasta deve conter os arquivos `.mp3` referenciados pelo campo `sfx` da resposta da IA (ver `CLAUDE.md`). Eles não são gerados pelo código — baixe efeitos sonoros livres de uso (ex. [Mixkit](https://mixkit.co/free-sound-effects/), [Freesound](https://freesound.org/) com licença CC0, ou [Zapsplat](https://www.zapsplat.com/) plano free) e salve com estes nomes exatos:

- `corrida_acelerada.mp3`
- `chute_seco.mp3`
- `passe_rasteiro.mp3`
- `cruzamento.mp3`
- `defesa_goleiro.mp3`
- `gol_torcida.mp3`
- `apito_juiz.mp3`

Se um arquivo estiver ausente, `lib/audioContext.ts` falha silenciosamente (a jogada anima sem aquele som específico, sem quebrar a aplicação).
