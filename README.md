# 📈 Procast

Would you like to estimate the future based on current data? The main purpose of this application is to forecast for a specific time serie. Have a [try](https://procast-ochre.vercel.app/)!

## ✨ Main features

Main functionalities of an app:

<ol>
<li><b>Config panel</b> - the following things can be configured
<ul style="list-style-type: square;">
<li><b>Training configuration</b> - user can chose or manipulate of several training options (bolded ones are default values):
    <ul>
        <li><i>Basic layer</i> - <b>LSTM</b>, GRU, SimpleRNN</li>
        <li><i>Help layer</i> - <b>Dropout</b>, BatchNormalization</li>
        <li><i>Loss Function</i> - <b>huberLoss</b>, meanSquaredError, absoluteDifference, computeWeightedLoss, hingeLoss, logLoss, sigmoidCrossEntropy, softmaxCrossEntropy</li>
        <li><i>Optimizer</i> - <b>rmsprop</b>, sgd, adam, adagrad, adadelta, momentum</li>
        <li><i>Learning Rate</i> - range from 0.001 to 30 (default: <b>20</b></li>
    </ul>
</li>
<li><b>Chart configuration</b>
    <ul>
    <li><i>Chart type</i> - <b>line</b>, bar, scatter</li>
    <li><i>Show Legend</i> - <b>No</b>/Yes</li>
    </ul>
</li>
<li><b>Chart configuration</b>
    <ul>
        <li><i>Chart type</i> - <b>line</b>, bar, scatter</li>
        <li><i>Show Legend</i> - <b>No</b>/Yes</li>
    </ul>
</li>
<li><b>File save config</b> - associated with "export to file" func
    <ul>
        <li><i>Preferred extension</i> - <b>csv</b>, xlsx</li>
    </ul>
</li>
</ul>
Every config property is stored in local storage
</li>
<li>
    Action panel
    <ul style="list-style-type: square;">
        <li><b>Generate prediction</b> - actually, this is the place when the fun begins. This one will trigger 'prediction' cycle which consider:
        <ul style="list-style-type: lower-alpha">
            <li>Adding basic, help, output layers</li>
            <li>Prepare model for training</li>
            <li>Create prediction sequences</li>
            <li>Generation of output predictions</li>
        </ul>
        </li>
        <li><b>Random</b> - it will randomize input data</li>
        <li><b>Load data</b> - data to predict can be loaded from csv/xlsx files</li>
        <li><b>Save data</b> - export generated sheet/data to file. Supported extensions: csv/xlsx</li>
        <li><b>Undo/redo</b> - revert/"un-revert" change of data set. Maximum threshold ("cache number") of this action is <b>20</b></li>
    </ul>
</li>
<li>
Worksheet - table which displays current sheet and data in form of table 
<ul style="list-style-type: square;">
    <li><b>Edit</b> current sheet name - this name will be used in exported file</li>
    <li><b>Edit</b> current loaded data</li>
</ul>
</li>
</ol>

> [!NOTE]  
> Some of values used in prediction process are hardcoded, eg. epochSize (100), batchSize (1), outputLength (2). These will be customizable in the future.

> [!IMPORTANT]  
> In order to load data, sheet needs to have two cells named 'label' and 'value'. 'value' cells are in restricted format - only 'numbers' are allowed

## ⚒ Architecture

<img style="width: 100%" src="https://raw.githubusercontent.com/MFella/procast/refs/heads/master/public/overall-architecture.svg" />
<br>
From above diagram, we can see that application is making usage of web worker. Tensorflow computations seems to be really heavy (create, compile and training of model), and it might impact on user experience. That's why web worker is responsible for making such actions.
<br>
<b>Notes:</b>

1. Predict action is triggered by main thread, and sent to web worker (in order to make computations);
2. Web worker can send actions to main thread:

- **success** - when computation finished, and next predicted data (outputLength) are delivered
- **progress** - when the next every tenth epoch was done (user can see progress on UI screen)
- **fail** - when something went wrong with computations (eg wrong data).

## 🌠 Next features

<ol>
<li>Make log-in functionality (make usage of generic-auth component)</li>
<li>Save prediction result to AWS S3 storage (for logged users)</li>
<li>Implement multiple figures functionality (multiple sheets)</li>
</ol>

## 💻 Tech Stack

|    Technology    |   Version    |
| :--------------: | :----------: |
|     Angular      |   ^19.0.0    |
| Angular Material |   ^19.0.2    |
|     Tailwind     |   ^3.4.16    |
|       RxJS       |    ~7.8.0    |
|       NgRx       | ^19.0.0-rc.0 |
|  Tensorflow.js   |   ^4.22.0    |
|     Chart.js     |    ^4.3.0    |
|     Ag Grid      |   ^32.3.3    |
|     SheetJS      |   ^0.18.5    |
