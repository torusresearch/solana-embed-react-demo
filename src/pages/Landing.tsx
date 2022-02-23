import { FC, useCallback, useState } from "react";
import Button from "../components/Button";
import BuildSelector from "../components/BuildSelector";
import { SUPPORTED_NETWORKS } from "../const";
import Torus, { TORUS_BUILD_ENV } from "@toruslabs/solana-embed";
import {
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import { writeToConsole } from "../helpers/console";

declare global {
  interface Window {
    torus: any;
  }
}

let torus: Torus;

const Landing: FC = () => {
  const [build, setBuild] = useState(TORUS_BUILD_ENV.TESTING);
  const [pubKey, setPubKey] = useState("");
  const [network, setNetwork] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [connection, setConnection] = useState<Connection>(
    new Connection(clusterApiUrl("mainnet-beta"))
  );
  const login = useCallback(async () => {
    try {
      if (!torus) {
        torus = new Torus();
      }
      if (!torus.isInitialized) {
        await torus.init({
          buildEnv: build,
          network: "mainnet-beta",
        });
      }
      const publicKeys = await torus?.login({});
      setPubKey(publicKeys ? publicKeys[0] : "");
      const target_network = (await torus.provider.request({
        method: "solana_provider_config",
        params: [],
      })) as { rpcTarget: string; displayName: string };
      setNetwork(target_network.displayName);
      setConnection(new Connection(target_network?.rpcTarget));
    } catch (err) {
      console.error(err);
    }
  }, [build]);

  const logout = useCallback(async () => {
    torus?.logout();
    setPubKey("");
  }, []);

  const transfer = useCallback(async () => {
    const blockhash = (await connection.getRecentBlockhash("finalized"))
      .blockhash;
    const TransactionInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(pubKey),
      toPubkey: new PublicKey(pubKey),
      lamports: 0.01 * LAMPORTS_PER_SOL,
    });
    let transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: new PublicKey(pubKey),
    }).add(TransactionInstruction);
    try {
      const res = await torus?.sendTransaction(transaction);
      writeToConsole("success", res as string);
    } catch (e) {
      writeToConsole("error", e as string);
    }
  }, [connection, pubKey]);

  const signTransaction = useCallback(async () => {
    const blockhash = (await connection.getRecentBlockhash("finalized"))
      .blockhash;
    const TransactionInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(pubKey),
      toPubkey: new PublicKey(pubKey),
      lamports: 0.01 * LAMPORTS_PER_SOL,
    });
    let transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: new PublicKey(pubKey),
    }).add(TransactionInstruction);

    try {
      const res = await torus?.signTransaction(transaction);
      writeToConsole("success", JSON.stringify(res));
    } catch (e) {
      writeToConsole("error", e as string);
    }
  }, [connection, pubKey]);

  const signAllTransaction = useCallback(async () => {
    function getNewTx() {
      let inst = SystemProgram.transfer({
        fromPubkey: new PublicKey(pubKey),
        toPubkey: new PublicKey(pubKey),
        lamports: 0.1 * Math.random() * LAMPORTS_PER_SOL,
      });
      return new Transaction({
        recentBlockhash: blockhash,
        feePayer: new PublicKey(pubKey),
      }).add(inst);
    }

    const blockhash = (await connection.getRecentBlockhash("finalized"))
      .blockhash;
    try {
      const res = await torus?.signAllTransactions([
        getNewTx(),
        getNewTx(),
        getNewTx(),
      ]);
      writeToConsole("success", JSON.stringify(res));
    } catch (e) {
      writeToConsole("error", e as string);
    }
  }, [connection, pubKey]);

  const signMessage = useCallback(async () => {
    try {
      let msg = Buffer.from("Test Signing Message ", "utf8");
      const res = await torus?.signMessage(msg);
      nacl.sign.detached.verify(
        msg,
        res as Uint8Array,
        new PublicKey(pubKey).toBytes()
      );
      writeToConsole("success", JSON.stringify(res));
    } catch (e) {
      writeToConsole("error", JSON.stringify(e));
    }
  }, [pubKey]);

  const changeProvider = useCallback(async () => {
    const toNetwork =
      network === SUPPORTED_NETWORKS["mainnet"].displayName
        ? "testnet"
        : "mainnet";
    await torus?.setProvider(SUPPORTED_NETWORKS[toNetwork]);
    setNetwork(SUPPORTED_NETWORKS[toNetwork].displayName);
    setConnection(new Connection(SUPPORTED_NETWORKS[toNetwork].rpcTarget));
  }, [network]);

  const getUserInfo = useCallback(async () => {
    try {
      const info = await torus?.getUserInfo();
      writeToConsole("success", JSON.stringify(info));
    } catch (error) {
      writeToConsole("error", JSON.stringify(error));
    }
  }, []);

  const toggleButton = useCallback(async () => {
    if (showButton) {
      torus?.hideTorusButton();
      setShowButton(false);
    } else {
      torus?.showTorusButton();
      setShowButton(true);
    }
    writeToConsole("success", `${showButton ? "show button" : "hide button"}`);
  }, [showButton]);

  const topup = useCallback(async () => {
    try {
      const result = await torus?.initiateTopup("rampnetwork", {
        selectedAddress: "3zLbFcrLPYk1hSdXdy1jcBRpeeXrhC47iCSjdwqsUaf9",
      });
      if (result) writeToConsole("success", "Top Up Successful");
    } catch {
      writeToConsole("error", "Top Up Failed");
    }
  }, []);

  return (
    <>
      <div className="landing">
        <div className="navbar">
          <div className="navbar__title">Solana Embed Demo</div>
          <div className="navbar__buttons"></div>
        </div>
        {!pubKey && (
          <div className="login">
            <BuildSelector build={build} setBuild={setBuild} />
            <Button onClick={login}>Login</Button>
          </div>
        )}
        {!!pubKey && (
          <div className="info">
            <div>
              Build Environment : <i>{build}</i>
            </div>
            <div>Solana Network : {network}</div>
            <div>Public key : {pubKey}</div>
            <Button onClick={logout}>Logout</Button>
          </div>
        )}
        {!!pubKey && (
          <>
            <span style={{ color: "#fff", fontSize: "1.6rem" }}>
              Torus Specific API
            </span>
            <div className="actions">
              <Button onClick={getUserInfo}>Get User Info</Button>
              <Button onClick={changeProvider}>Change Provider</Button>
              <Button onClick={toggleButton}>Toggle Show</Button>
              <Button onClick={topup}>Topup</Button>
            </div>
            <span style={{ color: "#fff", fontSize: "1.6rem" }}>
              Blockchain Specific API
            </span>
            <div className="actions">
              <Button onClick={signMessage}>Sign Message</Button>
              <Button onClick={signTransaction}>Sign Transaction</Button>
              <Button onClick={signAllTransaction}>Sign All Transaction</Button>
              <Button onClick={transfer}>Send Transaction</Button>
            </div>
          </>
        )}
        <div className="console-wrapper">
          <span>Console</span>
          <div id="console" contentEditable></div>
        </div>
      </div>
    </>
  );
};

export default Landing;
