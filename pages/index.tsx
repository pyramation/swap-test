import { useState } from 'react';
import { useWallet } from '@cosmos-kit/react';
import { StdFee } from '@cosmjs/amino';
import { SigningStargateClient } from '@cosmjs/stargate';
import BigNumber from 'bignumber.js';

import {
  Box,
  Divider,
  Grid,
  Heading,
  Text,
  Stack,
  Container,
  Link,
  Button,
  Flex,
  Icon,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import { BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';
import { chainassets, chainName, coin, dependencies, products } from '../config';

import { WalletStatus } from '@cosmos-kit/core';
import { Product, Dependency, WalletSection } from '../components';
import { cosmos, contracts } from 'juno-network';
import Head from 'next/head';

const JunoSwapClient = contracts.JunoSwap.JunoSwapClient;

const library = {
  title: 'Juno Network',
  text: 'Typescript libraries for the Juno ecosystem',
  href: 'https://github.com/CosmosContracts/typescript'
};

const sendTokens = (
  getStargateClient: () => Promise<SigningStargateClient>,
  setResp: () => any,
  address: string
) => {
  return async () => {
    const stargateClient = await getStargateClient();
    if (!stargateClient || !address) {
      console.error('stargateClient undefined or address undefined.');
      return;
    }

    const { send } = cosmos.bank.v1beta1.MessageComposer.withTypeUrl;

    const msg = send({
      amount: [
        {
          denom: coin.base,
          amount: '1000'
        }
      ],
      toAddress: address,
      fromAddress: address
    });

    const fee: StdFee = {
      amount: [
        {
          denom: coin.base,
          amount: '2000'
        }
      ],
      gas: '86364'
    };
    const response = await stargateClient.signAndBroadcast(address, [msg], fee);
    setResp(JSON.stringify(response, null, 2));
  };
};

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();

  const {
    getStargateClient,
    getCosmWasmClient,
    address,
    currentWallet,
    walletStatus
  } = useWallet();

  const [balance, setBalance] = useState(new BigNumber(0));
  const [resp, setResp] = useState('');
  const getBalance = async () => {
    if (!address) {
      setBalance(new BigNumber(0));
      return;
    }

    let rpcEndpoint = await currentWallet?.getRpcEndpoint();

    if (!rpcEndpoint) {
      console.log('no rpc endpoint — using a fallback');
      rpcEndpoint = `https://rpc.cosmos.directory/${chainName}`;
    }
    
    const signingCosmWasmClient = await getCosmWasmClient();

    const swapClient = new JunoSwapClient(
      signingCosmWasmClient,
      "juno1qff5wml0r3r7zm6tgv4k9wqnvelx8j7jss6a7g",
      "juno1sg6chmktuhyj4lsrxrrdflem7gsnk4ejv6zkcc4d3vcqulzp55wsf4l4gl"
    );
    
    const { balance } = await swapClient.balance({
      address: 'juno1qff5wml0r3r7zm6tgv4k9wqnvelx8j7jss6a7g',
    });
    
    console.log({ balance });

    setBalance(BigNumber(balance + ''));
  };

  const color = useColorModeValue('primary.500', 'primary.200');
  return (
    <Container maxW="5xl" py={10}>
      <Head>
        <title>Create Cosmos App</title>
        <meta name="description" content="Generated by create cosmos app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex justifyContent="end" mb={4}>
        <Button variant="outline" px={0} onClick={toggleColorMode}>
          <Icon
            as={colorMode === 'light' ? BsFillMoonStarsFill : BsFillSunFill}
          />
        </Button>
      </Flex>
      <Box textAlign="center">
        <Heading
          as="h1"
          fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
          fontWeight="extrabold"
          mb={3}
        >
          Create Cosmos App
        </Heading>
        <Heading
          as="h1"
          fontWeight="bold"
          fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
        >
          <Text as="span">Welcome to&nbsp;</Text>
          <Text as="span" color={color}>
            CosmosKit + Next.js +{' '}
            <a href={library.href} target="_blank" rel="noreferrer">
              {library.title}
            </a>
          </Text>
        </Heading>
      </Box>
      <WalletSection />

      {walletStatus === WalletStatus.Disconnected && (
        <Box textAlign="center">
          <Heading
            as="h3"
            fontSize={{ base: '1xl', sm: '2xl', md: '2xl' }}
            fontWeight="extrabold"
            m={30}
          >
            Connect your wallet!
          </Heading>
        </Box>
      )}

      {walletStatus === WalletStatus.Connected && (
        <Box textAlign="center">
          <Flex mb={4}>
            <Button
              variant="outline"
              onClick={sendTokens(
                getStargateClient as () => Promise<SigningStargateClient>,
                setResp as () => any,
                address as string
              )}
            >
              Send Tokens (to self)
            </Button>
            <Text as="span">Balance&nbsp;</Text>
            <Text as="span" color={color}>
              Balance: {balance.toNumber()}
            </Text>

            <Button variant="outline" onClick={getBalance}>
              Fetch Balance
            </Button>
          </Flex>
        </Box>
      )}

      {!!resp && (
        <>
          <Container>Response: </Container>
          <pre>{resp}</pre>
        </>
      )}

      <Dependency key={library.title} {...library}></Dependency>

      <Box mb={3}>
        <Divider />
      </Box>

      <Grid
        templateColumns={{
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        }}
        gap={8}
        mb={14}
      >
        {products.map((product) => (
          <Product key={product.title} {...product}></Product>
        ))}
      </Grid>

      <Grid templateColumns={{ md: '1fr 1fr' }} gap={8} mb={20}>
        {dependencies.map((dependency) => (
          <Dependency key={dependency.title} {...dependency}></Dependency>
        ))}
      </Grid>
      <Box mb={3}>
        <Divider />
      </Box>
      <Stack
        isInline={true}
        spacing={1}
        justifyContent="center"
        opacity={0.5}
        fontSize="sm"
      >
        <Text>Built with</Text>
        <Link
          href="https://cosmology.tech/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cosmology
        </Link>
      </Stack>
    </Container>
  );
}
