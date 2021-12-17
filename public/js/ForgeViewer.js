var urn =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Z2xqanZnZXUwYXlyZWF3cWxhdG95dno1NnRzamlsbXAtbmljZWNhci9Sb2JvdF93aXRoTGFzZXIxLmlwdA";
var Pivot_BaseRod;
var Pivot_LowerRodBody;
var Pivot_UpperRodBody;

var Helper_LowerArmBody;
var Helper_LowerRodBody;
var Helper_MiddleArmBody;
var Helper_UpperRodBody;
var Helper_UpperArmBody;
var Helper_HookBody;

const ID_BaseRod = 3;
const ID_LowerArmBody = 4;
const ID_LowerRodBody = 8;
const ID_MiddleArmBody = 7;
const ID_UpperRodBody = 6;
const ID_UpperArmBody = 5;
const ID_HookBody = 10;

const COMMANDS = ["ПОВОРОТ_ОСНОВАНИЕ", "ПОВОРОТ_ТУЛОВИЩЕ", "ПОВОРОТ_ГОЛОВА", "ПАУЗА"];

const MAIN_MAX_VALUE = 30;
const MAIN_MIN_VALUE = -30;
const BODY_MAX_VALUE = 35;
const BODY_MIN_VALUE = -30;
const HEAD_MAX_VALUE = 20;
const HEAD_MIN_VALUE = -200;

const TRANSLATE_VALUE_DEVIDER = 50;
const TRANSLATE_INTERVAL_DUR = 500;
const TRANSLATE_TIMEOUT_DUR = 600;

$(document).ready(function () {
  getForgeToken(function (access_token) {
    jQuery.ajax({
      url: "https://developer.api.autodesk.com/modelderivative/v2/designdata/" + urn + "/manifest",
      headers: { Authorization: "Bearer " + access_token },
      success: function (res) {
        if (res.status === "success") launchViewer(urn);
        else $("#forgeViewer").html("Преобразование всё ещё выполняется").css("color", "lightblue");
      },
    });
  });
});

function launchViewer(urn) {
  var options = {
    env: "AutodeskProduction",
    getAccessToken: getForgeToken,
  };

  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById("forgeViewer"), {
      extensions: [],
    });
    viewer.start();
    var documentId = "urn:" + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  var viewables = doc.getRoot().getDefaultGeometry();
  console.log(viewables);
  viewer.loadDocumentNode(doc, viewables).then((i) => {
    viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, setupMyModel);
    // documented loaded, any action?
  });
}

function onDocumentLoadFailure(viewerErrorCode, viewerErrorMsg) {
  console.error(
    "onDocumentLoadFailure() - errorCode:" + viewerErrorCode + "\n- errorMessage:" + viewerErrorMsg
  );
}

function onItemLoadFail(errorCode) {
  console.error("onItemLoadFail() - errorCode:" + errorCode);
}

function getForgeToken(callback) {
  fetch("/api/forge/oauth/token").then((res) => {
    res.json().then((data) => {
      callback(data.access_token, data.expires_in);
    });
  });
}

function setupMyModel() {
  tree = viewer.model.getData().instanceTree;

  // let ID_BaseRod = findNodeIdbyName('BaseRod');

  /* ====================== MainAxis ================= */

  Pivot_BaseRod = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  const Position_BaseRod = getFragmentWorldMatrixByNodeId(ID_BaseRod)
    .matrix[0].getPosition()
    .clone();
  Pivot_BaseRod.position.x = Position_BaseRod.x;
  Pivot_BaseRod.position.y = Position_BaseRod.y;
  Pivot_BaseRod.position.z = Position_BaseRod.z;
  viewer.overlays.addMesh(Pivot_BaseRod);

  Helper_LowerArmBody = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  const Position_LowerArmBody = getFragmentWorldMatrixByNodeId(ID_LowerArmBody)
    .matrix[0].getPosition()
    .clone();
  Helper_LowerArmBody.position.x =
    -Position_LowerArmBody.x + Math.abs(Position_LowerArmBody.x - Pivot_BaseRod.position.x);
  Helper_LowerArmBody.position.y =
    -Position_LowerArmBody.y + Math.abs(Position_LowerArmBody.y - Pivot_BaseRod.position.y);
  Helper_LowerArmBody.position.z =
    -Position_LowerArmBody.z + Math.abs(Position_LowerArmBody.z - Pivot_BaseRod.position.z) - 1700;
  Pivot_BaseRod.add(Helper_LowerArmBody);

  // /* ====================== SecondAxis ================= */

  Pivot_LowerRodBody = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  let Position_LowerRodBody = getFragmentWorldMatrixByNodeId(ID_LowerRodBody)
    .matrix[0].getPosition()
    .clone();

  Pivot_LowerRodBody.position.x = Position_LowerRodBody.x - Pivot_BaseRod.position.x;
  Pivot_LowerRodBody.position.y = Position_LowerRodBody.y - Pivot_BaseRod.position.y;
  Pivot_LowerRodBody.position.z = Position_LowerRodBody.z - Pivot_BaseRod.position.z;
  Pivot_BaseRod.add(Pivot_LowerRodBody);

  Helper_LowerRodBody = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  Helper_LowerRodBody.position.x =
    -Position_LowerRodBody.x +
    Math.abs(Position_LowerRodBody.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x);
  Helper_LowerRodBody.position.y =
    -Position_LowerRodBody.y +
    Math.abs(Position_LowerRodBody.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y);
  Helper_LowerRodBody.position.z =
    -Position_LowerRodBody.z +
    Math.abs(Position_LowerRodBody.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z);
  Pivot_LowerRodBody.add(Helper_LowerRodBody);

  Helper_MiddleArmBody = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  let Position_MiddleArmBody = getFragmentWorldMatrixByNodeId(ID_MiddleArmBody)
    .matrix[0].getPosition()
    .clone();
  Helper_MiddleArmBody.position.x =
    -Position_MiddleArmBody.x +
    Math.abs(Position_MiddleArmBody.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x);
  Helper_MiddleArmBody.position.y =
    -Position_MiddleArmBody.y +
    Math.abs(Position_MiddleArmBody.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y);
  Helper_MiddleArmBody.position.z =
    -Position_MiddleArmBody.z +
    Math.abs(Position_MiddleArmBody.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z);
  Pivot_LowerRodBody.add(Helper_MiddleArmBody);

  Pivot_UpperRodBody = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  let Position_UpperRodBody = getFragmentWorldMatrixByNodeId(ID_UpperRodBody)
    .matrix[0].getPosition()
    .clone();

  Pivot_UpperRodBody.position.x =
    Position_UpperRodBody.x - Pivot_LowerRodBody.position.x - Pivot_BaseRod.position.x;
  Pivot_UpperRodBody.position.y =
    Position_UpperRodBody.y - Pivot_LowerRodBody.position.y - Pivot_BaseRod.position.y;
  Pivot_UpperRodBody.position.z =
    Position_UpperRodBody.z - Pivot_LowerRodBody.position.z - Pivot_BaseRod.position.z;
  Pivot_LowerRodBody.add(Pivot_UpperRodBody);

  Helper_UpperRodBody = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );

  Helper_UpperRodBody.position.x =
    -Position_UpperRodBody.x +
    Math.abs(
      Position_UpperRodBody.x -
        Pivot_UpperRodBody.position.x -
        Pivot_LowerRodBody.position.x -
        Pivot_BaseRod.position.x
    );
  Helper_UpperRodBody.position.y =
    -Position_UpperRodBody.y +
    Math.abs(
      Position_UpperRodBody.y -
        Pivot_UpperRodBody.position.y -
        Pivot_LowerRodBody.position.y -
        Pivot_BaseRod.position.y
    );
  Helper_UpperRodBody.position.z =
    -Position_UpperRodBody.z +
    Math.abs(
      Position_UpperRodBody.z -
        Pivot_UpperRodBody.position.z -
        Pivot_LowerRodBody.position.z -
        Pivot_BaseRod.position.z
    );
  Pivot_UpperRodBody.add(Helper_UpperRodBody);

  Helper_UpperArmBody = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  let Position_UpperArmBody = getFragmentWorldMatrixByNodeId(ID_UpperArmBody)
    .matrix[0].getPosition()
    .clone();

  Helper_UpperArmBody.position.x =
    -Position_UpperArmBody.x +
    Math.abs(
      Position_UpperArmBody.x -
        Pivot_UpperRodBody.position.x -
        Pivot_LowerRodBody.position.x -
        Pivot_BaseRod.position.x
    );
  Helper_UpperArmBody.position.y =
    -Position_UpperArmBody.y +
    Math.abs(
      Position_UpperArmBody.y -
        Pivot_UpperRodBody.position.y -
        Pivot_LowerRodBody.position.y -
        Pivot_BaseRod.position.y
    ); //-
  //0.7;
  Helper_UpperArmBody.position.z =
    -Position_UpperArmBody.z +
    Math.abs(
      Position_UpperArmBody.z -
        Pivot_UpperRodBody.position.z -
        Pivot_LowerRodBody.position.z -
        Pivot_BaseRod.position.z
    ) -
    1100;
  Pivot_UpperRodBody.add(Helper_UpperArmBody);

  let Pivot_HookBody = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  let Position_HookBody = getFragmentWorldMatrixByNodeId(ID_HookBody)
    .matrix[0].getPosition()
    .clone();

  Pivot_HookBody.position.x =
    Position_HookBody.x -
    Pivot_UpperRodBody.position.x -
    Pivot_LowerRodBody.position.x -
    Pivot_BaseRod.position.x;
  Pivot_HookBody.position.y =
    Position_HookBody.y -
    Pivot_UpperRodBody.position.y -
    Pivot_LowerRodBody.position.y -
    Pivot_BaseRod.position.y; //+
  //1.3;
  Pivot_HookBody.position.z =
    Position_HookBody.z -
    Pivot_UpperRodBody.position.z -
    Pivot_LowerRodBody.position.z -
    Pivot_BaseRod.position.z;
  Pivot_UpperRodBody.add(Pivot_HookBody);

  Helper_HookBody = new THREE.Mesh(
    new THREE.BoxGeometry(0, 0, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  Helper_HookBody.position.x =
    -Position_HookBody.x +
    Math.abs(
      Position_HookBody.x -
        Pivot_HookBody.position.x -
        Pivot_UpperRodBody.position.x -
        Pivot_LowerRodBody.position.x -
        Pivot_BaseRod.position.x
    );
  Helper_HookBody.position.y =
    -Position_HookBody.y +
    Math.abs(
      Position_HookBody.y -
        Pivot_HookBody.position.y -
        Pivot_UpperRodBody.position.y -
        Pivot_LowerRodBody.position.y -
        Pivot_BaseRod.position.y
    ); //-
  //2.6;
  Helper_HookBody.position.z =
    -Position_HookBody.z +
    Math.abs(
      Position_HookBody.z -
        Pivot_HookBody.position.z -
        Pivot_UpperRodBody.position.z -
        Pivot_LowerRodBody.position.z -
        Pivot_BaseRod.position.z
    );
  Pivot_HookBody.add(Helper_HookBody);

  var geom = new THREE.BoxGeometry(5000, 5000, 1);
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  var boxMesh = new THREE.Mesh(geom, material);
  boxMesh.position.set(-Helper_HookBody.position.x, -Helper_HookBody.position.y, -1000);

  if (!viewer.overlays.hasScene("custom-scene")) {
    viewer.overlays.addScene("custom-scene");
  }

  viewer.overlays.addMesh(boxMesh, "custom-scene");

  assignTransformations(Helper_LowerArmBody, ID_LowerArmBody);
  assignTransformations(Helper_LowerRodBody, ID_LowerRodBody);
  assignTransformations(Helper_MiddleArmBody, ID_MiddleArmBody);
  assignTransformations(Helper_UpperRodBody, ID_UpperRodBody);
  assignTransformations(Helper_UpperArmBody, ID_UpperArmBody);
  assignTransformations(Helper_HookBody, ID_HookBody);
}

function assignTransformations(refererence_dummy, nodeId) {
  refererence_dummy.parent.updateMatrixWorld();
  var position = new THREE.Vector3();
  var rotation = new THREE.Quaternion();
  var scale = new THREE.Vector3();
  refererence_dummy.matrixWorld.decompose(position, rotation, scale);

  tree.enumNodeFragments(nodeId, function (frag) {
    var fragProxy = viewer.impl.getFragmentProxy(viewer.model, frag);
    fragProxy.getAnimTransform();
    fragProxy.position = position;
    fragProxy.quaternion = rotation;
    fragProxy.updateAnimTransform();
  });
}

function findNodeIdbyName(name) {
  let nodeList = Object.values(tree.nodeAccess.dbIdToIndex);
  for (let i = 1, len = nodeList.length; i < len; ++i) {
    let node_name = tree.getNodeName(nodeList[i]);
    if (node_name === name) {
      return nodeList[i];
    }
  }
  return null;
}

function getFragmentWorldMatrixByNodeId(nodeId) {
  let result = {
    fragId: [],
    matrix: [],
  };
  tree.enumNodeFragments(nodeId, function (frag) {
    let fragProxy = viewer.impl.getFragmentProxy(viewer.model, frag);
    let matrix = new THREE.Matrix4();

    fragProxy.getWorldMatrix(matrix);

    result.fragId.push(frag);
    result.matrix.push(matrix);
  });
  return result;
}

function onMainAxisChanged() {
  const rangeInputValue = document.getElementById("mainAxisSlider").value;
  mainPartTranslate(rangeInputValue, true);
}

function onSeconsAxisChanged() {
  const rangeInputValue = document.getElementById("secondAxisSlider").value;
  bodyPartTranslate(rangeInputValue, true);
}

function onThirdAxisChanged() {
  const rangeInputValue = document.getElementById("thirdAxisSlider").value;
  headPartTranslate(rangeInputValue, true);
}

function mainPartTranslate(value, fromSlider) {
  Pivot_BaseRod.rotation.y = fromSlider
    ? (-value * Math.PI) / 180
    : (-value * Math.PI) / 180 + Pivot_BaseRod.rotation.y;
  assignTransformations(Helper_LowerArmBody, ID_LowerArmBody);
  assignTransformations(Helper_LowerRodBody, ID_LowerRodBody);
  assignTransformations(Helper_MiddleArmBody, ID_MiddleArmBody);
  assignTransformations(Helper_UpperRodBody, ID_UpperRodBody);
  assignTransformations(Helper_UpperArmBody, ID_UpperArmBody);
  assignTransformations(Helper_HookBody, ID_HookBody);

  viewer.impl.sceneUpdated(true);
}

function bodyPartTranslate(value, fromSlider) {
  Pivot_LowerRodBody.rotation.x = fromSlider
    ? (-value * Math.PI) / 180
    : (-value * Math.PI) / 180 + Pivot_LowerRodBody.rotation.x;
  assignTransformations(Helper_MiddleArmBody, ID_MiddleArmBody);
  assignTransformations(Helper_UpperRodBody, ID_UpperRodBody);
  assignTransformations(Helper_UpperArmBody, ID_UpperArmBody);
  assignTransformations(Helper_HookBody, ID_HookBody);

  viewer.impl.sceneUpdated(true);
}

function headPartTranslate(value, fromSlider) {
  Pivot_UpperRodBody.rotation.x = fromSlider
    ? (-value * Math.PI) / 180
    : (-value * Math.PI) / 180 + Pivot_UpperRodBody.rotation.x;
  assignTransformations(Helper_UpperRodBody, ID_UpperRodBody);
  assignTransformations(Helper_UpperArmBody, ID_UpperArmBody);
  assignTransformations(Helper_HookBody, ID_HookBody);

  viewer.impl.sceneUpdated(true);
}

function onSendCommands() {
  let withDelay = false;

  const textAreaValue = document.getElementById("commands").value.trim().replace(/\n/g, "");
  let commands = textAreaValue.split(";").filter((v) => v !== "");
  console.log(commands);

  commands.forEach((command) => {
    const commandTitle = command.substring(0, command.indexOf("("));
    if (commandTitle === COMMANDS[3]) {
      withDelay = true;
      return;
    }
    if (withDelay) {
      withDelay = false;
      setTimeout(() => {
        handleCommand(command, commandTitle);
      }, TRANSLATE_TIMEOUT_DUR);
    } else handleCommand(command, commandTitle);
  });
}

function handleCommand(command, commandTitle) {
  let commandValue = command.substring(command.indexOf("(") + 1, command.indexOf(")"));
  if (COMMANDS.includes(commandTitle)) {
    switch (commandTitle) {
      //ОСНОВАНИЕ
      case COMMANDS[0]:
        if (commandValue > MAIN_MAX_VALUE) commandValue = MAIN_MAX_VALUE;
        if (commandValue < MAIN_MIN_VALUE) commandValue = MAIN_MIN_VALUE;
        updateWithAnimation(mainPartTranslate, commandValue / TRANSLATE_VALUE_DEVIDER);
        break;
      //ТУЛОВИЩЕ
      case COMMANDS[1]:
        if (commandValue > BODY_MAX_VALUE) commandValue = BODY_MAX_VALUE;
        if (commandValue < BODY_MIN_VALUE) commandValue = BODY_MIN_VALUE;
        updateWithAnimation(bodyPartTranslate, commandValue / TRANSLATE_VALUE_DEVIDER);
        break;
      //ГОЛОВА
      case COMMANDS[2]:
        if (commandValue > HEAD_MAX_VALUE) commandValue = HEAD_MAX_VALUE;
        if (commandValue < HEAD_MIN_VALUE) commandValue = HEAD_MIN_VALUE;
        updateWithAnimation(headPartTranslate, commandValue / TRANSLATE_VALUE_DEVIDER);
        break;
      default:
        break;
    }
  }
}

function updateWithAnimation(translateFunction, value) {
  let timer = 0;
  const updateInterval = setInterval(() => {
    timer += TRANSLATE_INTERVAL_DUR / TRANSLATE_VALUE_DEVIDER;
    translateFunction(value, false);
    if (timer === TRANSLATE_INTERVAL_DUR) clearInterval(updateInterval);
  }, TRANSLATE_INTERVAL_DUR / TRANSLATE_VALUE_DEVIDER);
}

function onClearCommands() {
  mainPartTranslate(0, true);
  bodyPartTranslate(0, true);
  headPartTranslate(0, true);
}
