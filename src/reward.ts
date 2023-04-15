import { ethers } from "ethers"
import erc20abi from "./abi/erc20.json"
import erc1155abi from "./abi/erc1155.json"

// sendReward(
//   "0xF4ac057e6D28812d9364523592cBcCE910fAb9e3",
//   "0xF42a28f3526BB32e3c46a54AbF98F4b96839688A",
//   "1000000000000000000"
// ).then((tx) => console.log(tx.hash))

const PROVIDER_RPC_URL = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"

// This method is used to send token to specific address.
export const sendERC20Reward = async (contractAddress: string, toAddress: string, amount: string) => {
  // Validate inputs
  if (!ethers.utils.isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }
  if (!ethers.utils.isAddress(toAddress)) {
    throw new Error("Invalid to address");
  }
  if (isNaN(parseFloat(amount))) {
    throw new Error("Invalid amount");
  }

  // Initialize provider and signer
  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_RPC_URL);
  const privateKey = process.env.PRIVATE_KEY || "";
  if (!privateKey) {
    throw new Error("Private key not found");
  }
  const signer = new ethers.Wallet(privateKey, provider);

  // Initialize contract
  const erc20 = new ethers.Contract(contractAddress, erc20abi, signer);

  // Estimate gas price and limit
  const gasPrice = await provider.getGasPrice();
  const gasLimit = await erc20.estimateGas.mintTo(toAddress, amount);

  // Send transaction
  const tx = await erc20.connect(signer).mintTo(toAddress, amount, { gasPrice, gasLimit });

  return tx;
};

export const sendERC1155Reward = async (
  contractAddress: string,
  tokenId: string,
  toAddress: string,
  amount: string
) => {
  // Validate inputs
  if (!ethers.utils.isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }
  if (!ethers.utils.isAddress(toAddress)) {
    throw new Error("Invalid to address");
  }
  if (isNaN(parseFloat(amount))) {
    throw new Error("Invalid amount");
  }

  // Initialize provider and signer
  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_RPC_URL);
  const privateKey = process.env.PRIVATE_KEY || "";
  if (!privateKey) {
    throw new Error("Private key not found");
  }
  const signer = new ethers.Wallet(privateKey, provider);

  // Initialize contract
  const erc1155 = new ethers.Contract(contractAddress, erc1155abi, signer);

  // Estimate gas price and limit
  const gasPrice = await provider.getGasPrice();
  const gasLimit = await erc1155.estimateGas.safeTransferFrom(
    signer.address,
    toAddress,
    tokenId,
    amount,
    '0x'
  );

  // Send transaction
  const tx = await erc1155.connect(signer).safeTransferFrom(
    signer.address,
    toAddress,
    tokenId,
    amount,
    '0x',
    { gasPrice, gasLimit }
  );

  return tx;
};