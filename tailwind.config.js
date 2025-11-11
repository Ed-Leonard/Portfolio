module.exports = {
	theme: {
		extend: {
			keyframes: {
				'pulse-fade': {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0.5 },
					'100%': { opacity: 0 },
				},
			},
			animation: {
				'pulse-fade': 'pulse-fade 2s ease-in-out 5 forwards',
			},
		}
	}
}
