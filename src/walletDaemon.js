const protoLoader = require('@grpc/proto-loader')
const gRPC = require('@grpc/grpc-js')

const { EventEmitter } = require('events')

module.exports = class walletNode extends EventEmitter {
  constructor (nodeAddress, readyCallback) {
    super()

    const packageDefinition = protoLoader.loadSync(__dirname + '/../protos/consensuswalletd.proto', {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    })

		const { consensuswalletd } = gRPC.loadPackageDefinition(packageDefinition).consensuswalletd

    this._client = new consensuswalletd(nodeAddress, gRPC.credentials.createInsecure(), {  
      "grpc.max_receive_message_length": -1
    })

    process.nextTick(() => readyCallback())
  }

  getAddresses () {
    return new Promise((resolve, reject) => {
      this._client.ShowAddresses({}, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.address)
      })
    })
  }

  checkAddress (address) {
    return new Promise((resolve, reject) => {
      this._client.CheckIfAddressIsValid({ address }, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.isValid)
      })
    })
  }

  createAddress () {
    return new Promise((resolve, reject) => {
      this._client.NewAddress({}, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.address)
      })
    })
  }

  getBalance () {
    return new Promise((resolve, reject) => {
      this._client.GetBalance({}, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data)
      })
    })
  }
	
  send (recipient, amount, password) {
    return new Promise((resolve, reject) => {
      this._client.Send({ toAddress: recipient, amount, password, from: [], fee: 0 }, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.txIDs)
      })
    })
  }

  sendFrom (sender, recipient, amount, password) {
    return new Promise((resolve, reject) => {
      this._client.Send({ toAddress: recipient, amount, password, from: [ sender ], fee: 0 }, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.txIDs)
      })
    })
  }

  sendWithFee (recipient, amount, password, fee, changeAddrOverride) {
    return new Promise((resolve, reject) => {
      this._client.Send({ toAddress: recipient, amount, password, from: [], fee, changeAddrOverride }, (err, data) => {
        if (err !== null) return reject(err)

        resolve(data.txIDs)
      })
    })
  }

	
}
