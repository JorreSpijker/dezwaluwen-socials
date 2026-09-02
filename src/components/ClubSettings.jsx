import { fileToDataUrl } from '../lib/image.js'
import { sharePreset } from '../lib/preset.js'

const FIELD = 'h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-900'

const BUTTON =
  'flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-base font-medium text-slate-700'

function TextField({ label, value, placeholder, autoCapitalize, onChange }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        // Op mobiel maken autocorrectie en hoofdletters van een clubcode of
        // handle iets anders dan er getypt is.
        autoCapitalize={autoCapitalize}
        autoCorrect="off"
        spellCheck={false}
        className={`mt-1 ${FIELD}`}
      />
    </label>
  )
}

function ImageField({ label, value, onPick, onClear }) {
  return (
    <div className="text-sm font-medium text-slate-700">
      {label}
      <div className="mt-1 flex items-center gap-3">
        {value && (
          <img
            src={value}
            alt=""
            className="size-12 shrink-0 rounded-md border border-slate-300 bg-white object-contain"
          />
        )}
        {/* De native bestandsknop is op mobiel te klein en toont een lange
            bestandsnaam die de rij uit elkaar duwt; vandaar een eigen knop. */}
        <label className={`min-w-0 flex-1 cursor-pointer ${BUTTON}`}>
          {value ? 'Vervangen' : 'Kies afbeelding'}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              onPick(e.target.files[0])
              // Leegmaken, anders vuurt change niet bij dezelfde foto opnieuw.
              e.target.value = ''
            }}
            className="sr-only"
          />
        </label>
        {value && (
          <button onClick={onClear} className={`shrink-0 ${BUTTON}`}>
            Wissen
          </button>
        )}
      </div>
    </div>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="block text-xs font-medium text-slate-700">
      {label}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white p-1"
      />
    </label>
  )
}

export default function ClubSettings({ config, onChange, onError }) {
  const set = (patch) => onChange({ ...config, ...patch })
  const setColor = (patch) => set({ colors: { ...config.colors, ...patch } })

  async function pickImage(field, file, maxW, maxH) {
    if (!file) return
    try {
      set({ [field]: await fileToDataUrl(file, maxW, maxH) })
    } catch (err) {
      onError(err.message)
    }
  }

  async function requestPreset() {
    try {
      await sharePreset(config)
    } catch (err) {
      onError(`Aanvraag mislukt: ${err.message}`)
    }
  }

  return (
    <details open={!config.clubCode} className="group rounded-md bg-white p-3">
      {/* De eigen chevron vervangt de standaardmarkering, die op mobiel klein
          en per browser anders is. */}
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-700 [&::-webkit-details-marker]:hidden">
        Clubinstellingen
        <svg
          viewBox="0 0 24 24"
          className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6 9 6 6 6-6"
          />
        </svg>
      </summary>

      <div className="mt-3 space-y-4">
        <TextField
          label="Clubcode"
          value={config.clubCode}
          placeholder="bijv. NCX35M2"
          autoCapitalize="characters"
          onChange={(v) => set({ clubCode: v.trim() })}
        />
        <TextField
          label="Clubnaam"
          value={config.name}
          placeholder="bijv. KV de Zwaluwen"
          onChange={(v) => set({ name: v })}
        />
        <TextField
          label="Social handle"
          value={config.handle}
          placeholder="bijv. @kvdezwaluwen"
          autoCapitalize="none"
          onChange={(v) => set({ handle: v })}
        />

        <ImageField
          label="Logo"
          value={config.logo}
          onPick={(file) => pickImage('logo', file, 520, 520)}
          onClear={() => set({ logo: null })}
        />
        <ImageField
          label="Achtergrond"
          value={config.background}
          onPick={(file) => pickImage('background', file, 1080, 1920)}
          onClear={() => set({ background: null })}
        />

        <div className="grid grid-cols-3 gap-3">
          <ColorField
            label="Hoofdkleur"
            value={config.colors.club}
            onChange={(v) => setColor({ club: v })}
          />
          <ColorField
            label="Donker"
            value={config.colors.clubdeep}
            onChange={(v) => setColor({ clubdeep: v })}
          />
          <ColorField
            label="Licht"
            value={config.colors.clubtint}
            onChange={(v) => setColor({ clubtint: v })}
          />
        </div>

        <div>
          <button
            onClick={requestPreset}
            disabled={!config.clubCode || !config.name}
            className={`w-full ${BUTTON} disabled:opacity-40`}
          >
            Club preset aanvraag
          </button>
          <p className="mt-2 text-xs font-normal text-slate-500">
            Stuurt deze instellingen als JSON-bestand, met logo en achtergrond erin, naar
            jorre@dezwaluwen.nl om als vaste club toegevoegd te worden.
          </p>
        </div>
      </div>
    </details>
  )
}
