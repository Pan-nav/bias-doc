/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			//Fonts used in the pages
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
				poppins: ['Poppins', 'sans-serif'],
			},
			//Colours used in the page
			colors: {
				primary: '#1898F4',

				landing: {
					white: '#FFFFFF',
					black: '#000000',
					blue: '#0025CE',
					cyan: '#00EAFF',
					gray: '#303E57',
					purple: '#4D3589',
					lightBlue: '#BADAFF',
				},

				'card': '#070707',
				'modal': '#000000',

				accent: {
					blue: '#0034EB',
					cyan: '#00F3F9',
					purple: '#0A34CD',
				},
			},

			//The colour of the background images of the page
			backgroundImage: {
				'main-gradient': 'linear-gradient(180deg, #00F3F9 0%, #000000 100%)',
				'landing-gradient': 'linear-gradient(135deg, #00EAFF 0%, #0025CE 25%, #4D3589 50%, #000000 100%)',
				'cta-gradient': 'linear-gradient(90deg, #1856F4 0%, #1898F4 21%, #6C5EAE 100%)',
			},

			//default radius for different components
			borderRadius: {
				'card': '12px',
				'button': '8px',
				'button-lg': '15px',
			},
		},
	},
	plugins: [],
}