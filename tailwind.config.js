/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // 메인 색상
        primary: '#56AEE9',
        // 강조 색상
        accent: '#278CCC',
        // 비활성화, 백 색상
        background: '#A7DAF9',
        // 하단 탭 및 보더 색상
        border: '#718096',
        // 텍스트 색상
        text: {
          black: '#000000',
          white: '#FFFFFF',
          brown: '#462000'
        },
        // 카드 색상
        card: {
          orange: '#FF9500',
          green: '#0DBA3F',
          purple: '#AF52DE',
          blue: '#007AFF',
          teal: '#30B0C7',
          pink: '#FF2DC3'
        },
        // 로그인 버튼 색상
        login: {
          yellow: '#FCE642',
          red: '#EF4040'
        }
      },
      opacity: {
        '30': '0.3',
        '40': '0.4'
      },
      borderRadius: {
        '10': '10px',
        '5': '5px'
      },
      borderWidth: {
        '2': '2px',
        '1': '1px'
      }
    },
  },
  plugins: [],
} 