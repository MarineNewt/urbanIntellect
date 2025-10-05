

export default async function handler(req, res) {
  // Generate a random number
  const min = 1;
  const max = 100;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  res.status(200).json({
    randomNumber: randomNumber,
    message: "Random number generated successfully.",
  });
}