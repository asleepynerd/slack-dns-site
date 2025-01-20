# Slack DNS Site

This project allows members of the Hack Club Slack to manage their subdomains easily. It provides a user-friendly interface for requesting and managing subdomains for various projects.

## Features

- **Slack Authentication**: Users can log in using their Hack Club Slack credentials.
- **Subdomain Management**: Easily request and manage subdomains for your projects.
- **Analytics**: Integrated analytics to track usage and performance.
- **Responsive Design**: Built with Tailwind CSS for a responsive and modern UI.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, MongoDB
- **Authentication**: NextAuth.js with Slack provider
- **Deployment**: Vercel

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/asleepynerd/slack-dns-site.git
   cd slack-dns-site
   ```

2. Install the dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   Create a `.env.local` file in the root directory and add your environment variables. You can refer to `.env.example` for the required variables.

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Configuration

- **Authentication**: You can change the authentication options in the NextAuth configuration located in `src/pages/api/auth/[...nextauth].ts`.
- **Available Domains**: Modify the available domains in `@/lib/cloudflare.ts` and the `.env` file.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you'd like to add.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Hack Club community for their support and inspiration.
- Special thanks to the libraries and tools that made this project possible.
