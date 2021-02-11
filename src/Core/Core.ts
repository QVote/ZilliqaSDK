import { bytes, BN, Long } from "@zilliqa-js/zilliqa";
import { Contract } from "@zilliqa-js/contract";
import { Transaction } from "@zilliqa-js/account";
import { QVoteContracts, Zil } from "../Utill";

class Core {
    protected VERSION: number;
    protected milliSecondsPerTxBlockAverage: number;
    protected code: string;

    constructor(protocol: { chainId: number, msgVersion: number }, milliSecondsPerTxBlockAverage: number, code: string) {
        this.VERSION = bytes.pack(protocol.chainId, protocol.msgVersion);
        this.milliSecondsPerTxBlockAverage = milliSecondsPerTxBlockAverage;
        this.code = code;
    }

    getDeployPayload({ gasPrice, gasLimit }: {
        gasPrice: BN,
        gasLimit?: Long.Long,
    }): [{ version: number, gasPrice: BN, gasLimit: Long.Long }, number, number, boolean] {
        const _gasPrice = gasPrice;
        const _gasLimit = gasLimit ? gasLimit : Long.fromNumber(100000);
        return [
            {
                version: this.VERSION,
                gasPrice: _gasPrice,
                gasLimit: _gasLimit,
            },
            33,
            1000,
            false
        ];
    }

    async getMinGasHandle(promise: Promise<Zil.RPCResponse<string, string>>): Promise<BN> {
        const minGasPrice = await promise;
        if (typeof minGasPrice.result == "undefined") {
            throw new Error("Couldn't get minimum gas price");
        }
        const res = new BN(minGasPrice.result);
        return res;
    }

    async deployContractHandle(promise: Promise<[Transaction, Contract]>): Promise<[string, Contract, Transaction]> {
        const [deployTx, contract] = await promise;
        if (typeof deployTx.txParams.receipt != "undefined") {
            if (typeof contract.address != "undefined") {
                return [contract.address, contract, deployTx];
            } else {
                throw new Error("There is no contract address");
            }
        } else {
            throw new Error("There is no tx receipt");
        }
    }

    protected createValueParam(
        type: QVoteContracts.Types.All,
        vname: string,
        value: QVoteContracts.ValueField,
    ): QVoteContracts.Value {
        return {
            type,
            value,
            vname
        };
    }
}

export { Core };