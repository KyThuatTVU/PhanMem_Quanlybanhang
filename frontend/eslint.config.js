import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
	{
		files: ['**/*.{js,jsx}'],
		ignores: ['dist/**', 'node_modules/**'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: { ecmaFeatures: { jsx: true } },
			globals: {
				window: 'readonly',
				document: 'readonly',
				localStorage: 'readonly',
				console: 'readonly',
				setTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				alert: 'readonly',
				confirm: 'readonly',
				Intl: 'readonly',
				URL: 'readonly',
				FormData: 'readonly',
				Image: 'readonly',
				FileReader: 'readonly',
				navigator: 'readonly',
				prompt: 'readonly',
				__dirname: 'readonly',
				URLSearchParams: 'readonly',
			},
		},
		plugins: {
			react,
			'react-hooks': reactHooks,
		},
		settings: { react: { version: 'detect' } },
		rules: {
			'no-undef': 'error',
			'no-unused-vars': 'off',
			'react/jsx-uses-react': 'off',
			'react/jsx-uses-vars': 'error',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'off',
		},
	},
];
