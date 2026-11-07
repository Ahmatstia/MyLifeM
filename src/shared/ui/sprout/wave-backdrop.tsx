import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { colors } from '@/theme/colors';

const s = colors.sprout;

export type WaveVariant = 'home' | 'form' | 'stats' | 'plain' | 'detail';

export interface WaveBackdropProps {
  variant?: WaveVariant;
  /** Tinggi area dekorasi atas (default 300). */
  height?: number;
  /** Tampilkan bukit dekoratif di bagian bawah layar. */
  withBottomHills?: boolean;
}

/**
 * Latar organik berlapis ala buku cerita (Storybook Botanical):
 * - Gradasi langit hijau daun hangat & kilau matahari emas
 * - Kanopi gelombang hijau hutan berlapis dengan aksen pita zamrud
 * - Siluet dedaunan tropis/botani, sulur tanaman, bunga kecil & kilau bintang ✨
 * - Bukit padang rumput berlapis lembut di dasar header dan kaki layar
 */
export const WaveBackdrop: React.FC<WaveBackdropProps> = ({
  variant = 'plain',
  height = 300,
  withBottomHills = false,
}) => {
  const { width } = useWindowDimensions();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        style={styles.top}
      >
        <Defs>
          {/* Gradasi langit hijau daun hangat */}
          <LinearGradient id="skyWashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#D4EBB5" stopOpacity="1" />
            <Stop offset="48%" stopColor="#E4F1CF" stopOpacity="0.96" />
            <Stop offset="85%" stopColor="#F1F6E4" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#FAF6EC" stopOpacity="0" />
          </LinearGradient>

          {/* Gradasi bukit daun lembut */}
          <LinearGradient id="meadowHillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#CBE4A8" stopOpacity="0.88" />
            <Stop offset="55%" stopColor="#DFF0C6" stopOpacity="0.82" />
            <Stop offset="100%" stopColor="#ECF5DC" stopOpacity="0.7" />
          </LinearGradient>

          {/* Gradasi cahaya matahari di kanan atas */}
          <RadialGradient id="sunGlowGrad" cx="88%" cy="14%" rx="48%" ry="48%">
            <Stop offset="0%" stopColor="#FFE47A" stopOpacity="0.68" />
            <Stop offset="45%" stopColor="#FFF0AD" stopOpacity="0.32" />
            <Stop offset="100%" stopColor="#FAF6EC" stopOpacity="0" />
          </RadialGradient>

          {/* Gradasi kanopi hutan tua */}
          <LinearGradient id="forestCanopyGrad" x1="0%" y1="0%" x2="90%" y2="100%">
            <Stop offset="0%" stopColor="#123C32" stopOpacity="1" />
            <Stop offset="60%" stopColor="#1E5A4C" stopOpacity="1" />
            <Stop offset="100%" stopColor="#297360" stopOpacity="1" />
          </LinearGradient>

          {/* Gradasi pita zamrud sekunder */}
          <LinearGradient id="jadeRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2B7562" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#69A750" stopOpacity="0.55" />
          </LinearGradient>
        </Defs>

        {(variant === 'home' || variant === 'detail' || variant === 'stats') && (
          <>
            {/* 1. Dasar langit hijau pastel hangat */}
            <Path
              d="M0 0 H400 V252 C354 228 302 264 234 258 C166 252 118 220 58 238 C32 246 14 258 0 266 Z"
              fill="url(#skyWashGrad)"
            />

            {/* 2. Cahaya matahari lembut dari sudut kanan atas */}
            <Path
              d="M150 0 H400 V220 C330 210 250 180 190 120 C158 88 148 42 150 0 Z"
              fill="url(#sunGlowGrad)"
            />

            {/* 3. Lingkaran halo matahari berlapis di sudut kanan atas */}
            <Circle cx={376} cy={22} r={58} fill="#FDE68A" opacity={0.28} />
            <Circle cx={376} cy={22} r={38} fill="#FCD34D" opacity={0.34} />
            <Circle cx={380} cy={18} r={20} fill={s.sun} opacity={0.55} />

            {/* 4. Gelombang bukit padang rumput berlapis di bagian bawah header */}
            <Path
              d="M0 186 C68 164 134 204 210 194 C284 184 342 146 400 166 V246 C348 226 296 258 230 252 C164 246 116 216 58 232 C32 240 14 250 0 258 Z"
              fill="url(#meadowHillGrad)"
            />
            <Path
              d="M0 218 C82 200 152 232 236 226 C310 220 358 196 400 208 V258 C352 238 298 268 232 262 C166 256 118 228 58 244 C32 251 14 260 0 268 Z"
              fill="#EBF5DA"
              opacity={0.85}
            />

            {/* Garis jahitan kontur buku cerita halus pada bukit */}
            <Path
              d="M14 212 C86 194 154 226 238 220 C308 214 354 192 392 202"
              stroke="#99C262"
              strokeWidth={1.3}
              strokeDasharray="4 6"
              fill="none"
              opacity={0.55}
            />

            {/* 5. Pita zamrud & garis emas di bawah kanopi kiri atas */}
            <Path
              d="M0 0 H212 C192 34 156 54 114 68 C70 82 32 104 0 134 Z"
              fill="url(#jadeRibbonGrad)"
            />
            <Path
              d="M0 116 C28 90 64 70 106 56 C144 43 176 26 196 0"
              stroke={s.sun}
              strokeWidth={2}
              fill="none"
              opacity={0.65}
            />

            {/* 6. Kanopi gelombang hijau hutan utama di kiri atas */}
            <Path
              d="M0 0 H184 C164 30 130 46 92 58 C54 70 24 90 0 116 Z"
              fill="url(#forestCanopyGrad)"
            />

            {/* Tekstur urat gelombang halus di dalam kanopi hutan */}
            <Path
              d="M0 78 C24 58 56 44 90 34 C118 26 142 14 156 0"
              stroke="#338570"
              strokeWidth={1.4}
              fill="none"
              opacity={0.55}
            />
            <Path
              d="M0 46 C22 32 48 22 76 16 C96 11 114 6 124 0"
              stroke="#3D947E"
              strokeWidth={1.2}
              fill="none"
              opacity={0.4}
            />

            {/* 7. Kluster dedaunan botani menjuntai dari kanopi kiri atas */}
            <G opacity={0.92}>
              {/* Daun limau kiri */}
              <Path
                d="M16 102 C22 118 38 122 44 112 C38 98 24 94 16 102 Z"
                fill="#8CC152"
              />
              <Path
                d="M18 103 C26 106 34 109 41 111"
                stroke="#E8F5D4"
                strokeWidth={1.1}
                strokeLinecap="round"
              />
              {/* Daun zamrud tengah */}
              <Path
                d="M72 64 C84 78 104 76 108 64 C98 52 80 54 72 64 Z"
                fill="#689F38"
              />
              <Path
                d="M75 64 C86 64 96 64 104 64"
                stroke="#D8EEB9"
                strokeWidth={1.1}
                strokeLinecap="round"
              />
              {/* Tunas daun kecil dekat puncak kanopi */}
              <Path
                d="M142 32 C154 40 168 36 170 26 C160 18 148 22 142 32 Z"
                fill="#9AD160"
              />
              <Circle cx={58} cy={82} r={3.2} fill={s.sun} />
              <Circle cx={128} cy={46} r={2.5} fill="#FFF7D6" />
            </G>

            {/* 8. Ranting daun botani melengkung di sisi kanan atas */}
            <G opacity={0.85}>
              <Path
                d="M400 72 C376 78 356 92 340 112"
                stroke="#558B2F"
                strokeWidth={1.8}
                strokeLinecap="round"
                fill="none"
              />
              {/* Pasangan daun pada ranting kanan */}
              <Path
                d="M378 78 C368 68 354 70 352 80 C362 88 374 86 378 78 Z"
                fill="#8CC152"
              />
              <Path
                d="M362 90 C370 102 384 102 388 92 C380 84 368 84 362 90 Z"
                fill="#689F38"
              />
              <Path
                d="M348 102 C338 96 326 100 326 108 C334 114 344 110 348 102 Z"
                fill="#9CCC65"
              />
              {/* Tunas pucuk */}
              <Path
                d="M340 112 C330 114 324 122 328 128 C336 126 340 118 340 112 Z"
                fill="#7CB342"
              />
            </G>

            {/* 9. Tunas kecambah & bunga kecil di lembah bukit kanan */}
            <G opacity={0.85}>
              <Path
                d="M308 188 C308 176 310 170 312 164"
                stroke="#4E8C35"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
              <Path
                d="M311 168 C301 160 293 164 295 172 C297 178 306 176 311 168 Z"
                fill="#8CC152"
              />
              <Path
                d="M312 166 C322 158 330 162 328 170 C326 176 317 174 312 166 Z"
                fill="#689F38"
              />
            </G>

            {/* 10. Taburan bintang buku cerita (✨) & partikel cahaya */}
            {/* Bintang emas utama */}
            <Path
              d="M276 42 L279 50 L287 53 L279 56 L276 64 L273 56 L265 53 L273 50 Z"
              fill={s.sun}
              opacity={0.9}
            />
            {/* Bintang emas kedua */}
            <Path
              d="M222 76 L224 81 L229 83 L224 85 L222 90 L220 85 L215 83 L220 81 Z"
              fill="#F5B82E"
              opacity={0.78}
            />
            {/* Bintang kecil kanan */}
            <Path
              d="M326 32 L327.5 36 L331.5 37.5 L327.5 39 L326 43 L324.5 39 L320.5 37.5 L324.5 36 Z"
              fill={s.sun}
              opacity={0.85}
            />
            {/* Titik-titik embun & cahaya bokeh */}
            <Circle cx={248} cy={44} r={3} fill="#FFFFFF" opacity={0.75} />
            <Circle cx={304} cy={78} r={2.5} fill={s.sun} opacity={0.7} />
            <Circle cx={194} cy={52} r={2.2} fill="#8CC152" opacity={0.55} />
            <Circle cx={352} cy={54} r={3.5} fill="#FFFFFF" opacity={0.65} />
            <Ellipse
              cx={260}
              cy={110}
              rx={5}
              ry={2.4}
              transform="rotate(-24 260 110)"
              fill="#9CCC65"
              opacity={0.45}
            />
          </>
        )}

        {variant === 'form' && (
          <>
            {/* Latar lembut form dengan kanopi & cahaya matahari */}
            <Path
              d="M0 0 H400 V176 C348 158 292 188 222 182 C152 176 96 150 38 166 C20 171 8 178 0 184 Z"
              fill="url(#skyWashGrad)"
              opacity={0.78}
            />
            <Circle cx={392} cy={28} r={62} fill="#FDE68A" opacity={0.35} />
            <Circle cx={398} cy={28} r={42} fill={s.sun} opacity={0.85} />
            <Path
              d="M0 0 H182 C162 28 128 42 90 54 C54 66 24 84 0 108 Z"
              fill="url(#jadeRibbonGrad)"
            />
            <Path
              d="M0 0 H158 C140 24 110 36 78 46 C46 56 20 72 0 94 Z"
              fill="url(#forestCanopyGrad)"
            />
            <Path
              d="M308 32 L310.5 38 L316.5 40.5 L310.5 43 L308 49 L305.5 43 L299.5 40.5 L305.5 38 Z"
              fill={s.sun}
              opacity={0.85}
            />
            <Circle cx={272} cy={46} r={2.8} fill={s.sun} opacity={0.7} />
          </>
        )}

        {variant === 'plain' && (
          <>
            <Path
              d="M0 0 H164 C146 24 116 38 82 48 C48 58 22 74 0 96 Z"
              fill="url(#jadeRibbonGrad)"
            />
            <Path
              d="M0 0 H140 C122 20 96 32 66 40 C40 47 18 58 0 74 Z"
              fill="url(#forestCanopyGrad)"
            />
          </>
        )}
      </Svg>

      {withBottomHills && (
        <Svg
          width={width}
          height={136}
          viewBox="0 0 400 136"
          preserveAspectRatio="none"
          style={styles.bottom}
        >
          <Path
            d="M0 78 C64 48 128 82 198 72 C264 62 324 28 400 44 V136 H0 Z"
            fill="#E3EED3"
          />
          <Path
            d="M0 92 C72 68 134 98 206 90 C272 82 326 106 376 112 V136 H0 Z"
            fill="#CFE6B0"
            opacity={0.85}
          />
          <Path
            d="M226 136 C262 94 318 66 400 58 V136 Z"
            fill={s.forest}
          />
          <Circle cx={388} cy={64} r={26} fill={s.sun} opacity={0.92} />
          {/* Tunas kecil di bukit bawah kiri */}
          <Path
            d="M42 86 C34 78 26 80 28 88 C30 94 38 92 42 86 Z"
            fill="#7CB342"
          />
          <Path
            d="M43 85 C50 76 58 78 56 86 C54 92 47 90 43 85 Z"
            fill="#8CC152"
          />
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0 },
  bottom: { position: 'absolute', bottom: 0, left: 0 },
});
