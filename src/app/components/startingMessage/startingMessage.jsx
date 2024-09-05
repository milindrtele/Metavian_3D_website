import styles from "./startingMessage.module.css";

export default function StartingMessage(props) {
  return (
    <div
      onClick={() => {
        props.continue();
      }}
      className={styles.starting_message_page}
    >
      <div className={styles.starting_message_container}>
        <p className={styles.starting_message_title}>DID YOU KNOW ?</p>
        <p className={styles.starting_message}>
          {/* Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. */}
          Imagination is more important than knowledge. For knowledge is
          limited, whereas imagination embraces the entire world, stimulating
          progress, giving birth to evolution.
        </p>
      </div>
    </div>
  );
}
